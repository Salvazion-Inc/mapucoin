import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, describe, it } from "node:test";
import { GET as callbackGet } from "../app/auth/callback/route.ts";
import { clearAuthCookieHeaders } from "../lib/auth-cookies.ts";
import { at } from "../lib/app-copy.ts";
import { GOOGLE_MARKER } from "../lib/google-oauth.ts";
import { hashPassword, verifyPassword } from "../lib/passwords.ts";
import {
  createRecoveryAdmin,
  createRecoveryToken,
  FORGOT_EMAIL_LIMIT,
  FORGOT_IP_LIMIT,
  establishRecoverySession,
  inspectRecoveryRequest,
  readRecoveryToken,
  RECOVERY_COOKIE,
  RECOVERY_EMAIL_BODY,
  RECOVERY_EMAIL_SUBJECT,
  RECOVERY_TTL_SEC,
  recoveryEmailOrigin,
  requestPasswordReset,
  resetPasswordRecoveryMemory,
  UPDATE_PASSWORD_PATH,
  updateRecoveredPassword,
  type RecoveryAdmin,
} from "../lib/password-recovery.ts";
import {
  ACCOUNTS_COOKIE,
  cookieValue,
  readAccounts,
  signAccounts,
  signValue,
} from "../lib/session.ts";

const mailEnv = {
  RESEND_API_KEY: "re_test_recovery_key",
  MAIL_FROM: "Mapucoin <info@salvazion.org>",
} as unknown as NodeJS.ProcessEnv;

type Stored = {
  id: string;
  email: string;
  name: string;
  appMetadata: Record<string, unknown>;
  password?: string;
};

function installAdmin(users: Stored[], opts?: { verifyAlways?: boolean }) {
  const byId = new Map(users.map((user) => [user.id, user]));
  const calls = {
    generate: [] as { email: string; redirectTo: string }[],
    verify: [] as string[],
    revoke: [] as string[],
    update: [] as { id: string; password: string }[],
    clearJti: 0,
  };
  const burned = new Set<string>();
  let acceptJti = true;
  const admin: RecoveryAdmin = {
    async generateLink(email, redirectTo) {
      calls.generate.push({ email, redirectTo });
      const user = [...byId.values()].find((item) => item.email === email);
      if (!user) return { ok: false };
      return {
        ok: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        hashedToken: `hash-${user.id}`,
        appMetadata: { ...user.appMetadata },
      };
    },
    async getUser(userId) {
      const user = byId.get(userId);
      if (!user) return null;
      return { id: user.id, email: user.email, appMetadata: { ...user.appMetadata } };
    },
    async setRecoveryJti(userId, jti, appMetadata) {
      if (!acceptJti) return false;
      const user = byId.get(userId);
      if (!user) return false;
      user.appMetadata = { ...appMetadata, mapucoin_recovery_jti: jti };
      return true;
    },
    async clearRecoveryJti(userId, appMetadata) {
      const user = byId.get(userId);
      if (!user) return false;
      user.appMetadata = { ...appMetadata, mapucoin_recovery_jti: null };
      calls.clearJti += 1;
      return true;
    },
    async verifyRecovery(tokenHash) {
      calls.verify.push(tokenHash);
      if (opts?.verifyAlways) return "access-jwt";
      if (burned.has(tokenHash)) return null;
      burned.add(tokenHash);
      return tokenHash.startsWith("hash-") ? "access-jwt" : null;
    },
    async revokeSessions(accessToken) {
      calls.revoke.push(accessToken);
      return accessToken === "access-jwt";
    },
    async updatePassword(userId, password) {
      const user = byId.get(userId);
      if (!user) return false;
      user.password = password;
      calls.update.push({ id: userId, password });
      return true;
    },
  };
  return {
    admin,
    calls,
    byId,
    refuseJti() {
      acceptJti = false;
    },
  };
}

function mailBox(status = 200) {
  const sent: { to?: string; subject?: string; html?: string; from?: string }[] = [];
  const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) !== "https://api.resend.com/emails") {
      throw new Error(`unexpected fetch ${String(url)}`);
    }
    const body = JSON.parse(String(init?.body || "{}")) as {
      to?: string;
      subject?: string;
      html?: string;
      from?: string;
    };
    sent.push(body);
    return new Response("{}", { status });
  }) as typeof fetch;
  return { sent, fetchImpl };
}

function hrefFrom(html: string) {
  const match = html.match(/href="([^"]+)"/);
  assert.ok(match, "email has a link");
  return match[1].replace(/&amp;/g, "&");
}

async function plantRecoveryCookie(html: string, admin: RecoveryAdmin) {
  const link = new URL(hrefFrom(html));
  assert.equal(link.pathname, UPDATE_PASSWORD_PATH);
  assert.equal(link.search, "");
  const token = new URLSearchParams(link.hash.replace(/^#/, "")).get("token");
  assert.ok(token);
  assert.equal(new URL(link.origin + link.pathname + link.search).searchParams.get("token"), null);
  const planted = await establishRecoverySession(
    new Request("https://mapucoin.com/api/auth/recovery-session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "mapucoin.com",
        "x-forwarded-proto": "https",
        "x-forwarded-for": crypto.randomUUID(),
      },
      body: JSON.stringify({ token }),
    }),
    { admin },
  );
  const plantedBody = await planted.json();
  assert.equal(planted.status, 200);
  assert.deepEqual(plantedBody, { ok: true });
  const rawCookie = planted.headers.getSetCookie().find((line) => line.startsWith(`${RECOVERY_COOKIE}=`));
  assert.ok(rawCookie);
  assert.match(rawCookie, /HttpOnly/);
  assert.match(rawCookie, /Secure/);
  const maxAge = Number(rawCookie.match(/Max-Age=(\d+)/)?.[1] || "0");
  assert.ok(maxAge >= 890 && maxAge <= 900, `Max-Age ${maxAge}`);
  return decodeURIComponent(rawCookie.split(";")[0].slice(RECOVERY_COOKIE.length + 1));
}

function forgotRequest(email: string, ip: string, host = "mapucoin.com", env = mailEnv) {
  return new Request("https://mapucoin.com/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
      host,
      "x-forwarded-proto": "https",
    },
    body: JSON.stringify({ email }),
  });
}

describe("password recovery (DEC-20261021-02)", () => {
  beforeEach(() => {
    resetPasswordRecoveryMemory();
  });

  it("keeps the service role required and the recovery copy in Spanish", () => {
    const source = readFileSync("lib/password-recovery.ts", "utf8");
    assert.match(source, /\["SUPABASE_SERVICE_ROLE_KEY"\]/);
    assert.match(source, /\["NEXT_PUBLIC_SUPABASE_URL"\]/);
    assert.equal(source.includes("process.env.SUPABASE_SERVICE_ROLE_KEY"), false);
    assert.equal(source.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), false);
    assert.equal(source.includes("resetPasswordForEmail"), false);
    assert.equal(source.includes("devUrl"), false);
    assert.equal(source.includes("action_link"), false);
    assert.match(source, /type: "recovery"/);
    assert.match(source, /updateUserById/);
    assert.match(source, /verifyOtp/);
    assert.match(source, /after\(/);
    assert.match(source, /signOut\(accessToken, "global"\)/);
    assert.match(source, /AES-GCM/);
    assert.match(source, /AUTH_SECRET/);
    assert.match(source, /in-memory per instance/);
    assert.equal(source.includes("process.env.RECOVERY"), false);
    assert.equal(RECOVERY_TTL_SEC, 15 * 60);
    assert.equal(
      createRecoveryAdmin({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "browser-key",
      } as unknown as NodeJS.ProcessEnv),
      null,
    );

    const es = at("es");
    assert.equal(es.forgotLink, "¿Olvidaste tu contraseña?");
    assert.equal(es.forgotTitle, "Recuperar contraseña");
    assert.equal(
      es.forgotLead,
      "Escribe el correo de tu cuenta. Si está registrado, te enviamos un enlace para elegir una contraseña nueva.",
    );
    assert.equal(es.forgotCta, "Enviar enlace");
    assert.equal(
      es.forgotSent,
      "Si existe una cuenta con ese correo, enviamos un enlace para restablecer la contraseña. Revisa tu bandeja de entrada y la carpeta de spam.",
    );
    assert.equal(es.forgotRateLimited, "Demasiados intentos. Espera un momento e inténtalo de nuevo.");
    assert.equal(es.forgotBack, "Volver a entrar");
    assert.equal(es.updateTitle, "Nueva contraseña");
    assert.equal(
      es.updateLead,
      "Elige una contraseña nueva para tu cuenta Mapucoin. Después vuelve a entrar.",
    );
    assert.equal(es.updateCta, "Guardar contraseña");
    assert.equal(es.updateExpired, "El enlace expiró o ya se usó. Pide uno nuevo.");
    assert.equal(es.updateAgain, "Pedir un enlace nuevo");
    assert.equal(
      es.linkExpired,
      "El enlace para restablecer la contraseña expiró o ya se usó. Pide uno nuevo.",
    );
    assert.equal(RECOVERY_EMAIL_SUBJECT, "Restablece tu contraseña en Mapucoin");
    assert.equal(
      RECOVERY_EMAIL_BODY.intro,
      "Recibimos una solicitud para restablecer la contraseña de tu cuenta Mapucoin. Este enlace caduca en 15 minutos y solo se puede usar una vez.",
    );
    assert.equal(RECOVERY_EMAIL_BODY.action, "Restablecer contraseña");
    assert.equal(
      RECOVERY_EMAIL_BODY.ignore,
      "Si no fuiste tú, ignora este correo. Tu contraseña no cambiará.",
    );
    for (const locale of ["en", "pt", "fr", "it", "de"] as const) {
      assert.ok(at(locale).forgotLink.length > 3);
      assert.ok(at(locale).updateTitle.length > 3);
    }
  });

  it("answers known and unknown emails the same and emails a mapucoin.com link", async () => {
    const ip = crypto.randomUUID();
    const box = mailBox();
    const rig = installAdmin([
      { id: "user-1", email: "ana@mapucoin.test", name: "Ana <R>", appMetadata: { provider: "email" } },
    ]);
    const known = await requestPasswordReset(forgotRequest("Ana@mapucoin.test", ip), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    const unknown = await requestPasswordReset(forgotRequest("missing@mapucoin.test", ip), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    const knownBody = await known.text();
    const unknownBody = await unknown.text();
    assert.equal(known.status, 200);
    assert.equal(unknown.status, 200);
    assert.equal(knownBody, unknownBody);
    assert.equal(knownBody, '{"ok":true}');
    assert.equal(knownBody.includes("devUrl"), false);
    assert.equal(knownBody.includes("http"), false);
    assert.equal(knownBody.includes("hash-"), false);
    assert.equal(box.sent.length, 1);
    assert.equal(box.sent[0]?.from, "Mapucoin <info@salvazion.org>");
    assert.equal(box.sent[0]?.to, "ana@mapucoin.test");
    assert.equal(box.sent[0]?.subject, RECOVERY_EMAIL_SUBJECT);
    const html = box.sent[0]?.html || "";
    assert.match(html, /Hola Ana &lt;R&gt;,/);
    assert.match(html, /Recibimos una solicitud para restablecer la contraseña/);
    assert.match(html, /Este enlace caduca en 15 minutos y solo se puede usar una vez/);
    assert.match(html, />Restablecer contraseña</);
    assert.match(html, /Si no fuiste tú, ignora este correo/);
    assert.equal(html.includes("supabase.co"), false);
    const link = new URL(hrefFrom(html));
    assert.equal(link.origin, "https://mapucoin.com");
    assert.equal(link.pathname, UPDATE_PASSWORD_PATH);
    assert.equal(link.search, "");
    const mailedToken = new URLSearchParams(link.hash.replace(/^#/, "")).get("token");
    assert.ok(mailedToken);
    assert.equal(link.searchParams.get("token"), null);
    assert.equal(mailedToken.includes("hash-"), false);
    assert.equal(mailedToken.includes("tokenHash"), false);
    assert.equal(mailedToken.includes("ana@mapucoin.test"), false);
    assert.equal(knownBody.includes(mailedToken), false);
    const redirect = new URL(rig.calls.generate[0]?.redirectTo || "");
    assert.equal(redirect.origin, "https://mapucoin.com");
    assert.equal(redirect.pathname, "/auth/callback");
    assert.equal(redirect.searchParams.get("next"), UPDATE_PASSWORD_PATH);
    assert.equal(redirect.searchParams.get("token"), null);
    assert.equal(rig.calls.generate[1]?.email, "missing@mapucoin.test");
  });

  it("returns before the account lookup so a missing account is not faster", async () => {
    const rig = installAdmin([
      { id: "user-1", email: "ana@mapucoin.test", name: "Ana", appMetadata: {} },
    ]);
    const original = rig.admin.generateLink.bind(rig.admin);
    const pending: {
      email: string;
      redirectTo: string;
      resolve: (value: Awaited<ReturnType<RecoveryAdmin["generateLink"]>>) => void;
    }[] = [];
    rig.admin.generateLink = (email, redirectTo) =>
      new Promise((resolve) => {
        pending.push({ email, redirectTo, resolve });
      });
    const box = mailBox();
    const ip = crypto.randomUUID();
    const opts = {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
      schedule(task: () => Promise<void>) {
        void task();
      },
    };
    const knownP = requestPasswordReset(forgotRequest("ana@mapucoin.test", ip), opts);
    const unknownP = requestPasswordReset(forgotRequest("missing@mapucoin.test", ip), opts);
    const known = await Promise.race([
      knownP,
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("waited on lookup")), 500)),
    ]);
    const unknown = await unknownP;
    assert.equal(pending.length, 2);
    assert.equal(box.sent.length, 0);
    assert.equal(await known.text(), '{"ok":true}');
    assert.equal(await unknown.text(), '{"ok":true}');
    for (const item of pending) {
      item.resolve(await original(item.email, item.redirectTo));
    }
    for (let i = 0; i < 20 && box.sent.length < 1; i += 1) {
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.equal(box.sent.length, 1);
    assert.equal(box.sent[0]?.to, "ana@mapucoin.test");
  });

  it("keeps the email on mapucoin.com for preview hosts and on localhost only outside production", () => {
    const preview = new Request("https://mapucoin.com/api/auth/forgot-password", {
      headers: { "x-forwarded-host": "mapucoin-git-preview.vercel.app", "x-forwarded-proto": "https" },
    });
    assert.equal(recoveryEmailOrigin(preview, mailEnv), "https://mapucoin.com");
    const local = new Request("http://localhost:3000/api/auth/forgot-password", {
      headers: { host: "localhost:3000", "x-forwarded-proto": "http" },
    });
    assert.equal(recoveryEmailOrigin(local, mailEnv), "http://localhost:3000");
    assert.equal(
      recoveryEmailOrigin(local, { ...mailEnv, VERCEL_ENV: "production" }),
      "https://mapucoin.com",
    );
  });

  it("rate-limits repeated requests with 429 and does not reveal a link", async () => {
    const rig = installAdmin([
      { id: "user-2", email: "rate@mapucoin.test", name: "Rae", appMetadata: {} },
    ]);
    const box = mailBox();
    const ip = crypto.randomUUID();
    for (let n = 0; n < FORGOT_EMAIL_LIMIT; n += 1) {
      const res = await requestPasswordReset(forgotRequest("rate@mapucoin.test", ip), {
        env: mailEnv,
        fetchImpl: box.fetchImpl,
        admin: rig.admin,
      });
      assert.equal(res.status, 200, `attempt ${n + 1}`);
    }
    const blocked = await requestPasswordReset(forgotRequest("rate@mapucoin.test", ip), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    assert.equal(blocked.status, 429);
    assert.equal(await blocked.text(), '{"error":"rate_limited"}');
    assert.ok(Number(blocked.headers.get("Retry-After")) >= 1);

    const sharedIp = crypto.randomUUID();
    for (let n = 0; n < FORGOT_IP_LIMIT; n += 1) {
      const res = await requestPasswordReset(
        forgotRequest(`nobody-${n}@mapucoin.test`, sharedIp),
        { env: mailEnv, fetchImpl: box.fetchImpl, admin: rig.admin },
      );
      assert.equal(res.status, 200);
    }
    const ipBlocked = await requestPasswordReset(
      forgotRequest("nobody-extra@mapucoin.test", sharedIp),
      { env: mailEnv, fetchImpl: box.fetchImpl, admin: rig.admin },
    );
    assert.equal(ipBlocked.status, 429);
  });

  it("rejects a bad email, a foreign origin, a missing admin, and a failed save without a link", async () => {
    const rig = installAdmin([
      { id: "user-3", email: "save@mapucoin.test", name: "", appMetadata: {} },
    ]);
    const box = mailBox();
    const invalid = await requestPasswordReset(forgotRequest("not-an-email", crypto.randomUUID()), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    assert.equal(invalid.status, 400);
    assert.equal(await invalid.text(), '{"error":"email"}');
    assert.equal(rig.calls.generate.length, 0);

    const foreign = await requestPasswordReset(
      new Request("https://mapucoin.com/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
          "x-forwarded-for": crypto.randomUUID(),
        },
        body: JSON.stringify({ email: "save@mapucoin.test" }),
      }),
      { env: mailEnv, fetchImpl: box.fetchImpl, admin: rig.admin },
    );
    assert.equal(foreign.status, 403);
    assert.equal(rig.calls.generate.length, 0);

    const offline = await requestPasswordReset(
      forgotRequest("save@mapucoin.test", crypto.randomUUID()),
      { env: mailEnv, fetchImpl: box.fetchImpl, admin: null },
    );
    assert.equal(await offline.text(), '{"ok":true}');
    assert.equal(box.sent.length, 0);

    rig.refuseJti();
    const logs: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      logs.push(args.map((item) => String(item)).join(" "));
    };
    try {
      const unsaved = await requestPasswordReset(
        forgotRequest("save@mapucoin.test", crypto.randomUUID()),
        { env: mailEnv, fetchImpl: box.fetchImpl, admin: rig.admin },
      );
      assert.equal(await unsaved.text(), '{"ok":true}');
    } finally {
      console.error = original;
    }
    assert.equal(box.sent.length, 0);
    assert.equal(logs.join("\n").includes("re_test_recovery_key"), false);
  });

  it("expires the token quickly, ignores the next param, and sets the password once", async () => {
    const issuedAt = 1_000_000;
    const token = await createRecoveryToken(
      { email: "ana@mapucoin.test", userId: "user-1", tokenHash: "hash-user-1", jti: "jti-1" },
      issuedAt,
    );
    assert.ok(await readRecoveryToken(token, 1_899_000));
    assert.equal(await readRecoveryToken(token, 1_900_000), null);
    const tampered = `${token.slice(0, -2)}aa`;
    assert.equal(await readRecoveryToken(tampered, issuedAt), null);
    const other = await signValue(JSON.stringify({ kind: "email-verify", email: "a@b.co", exp: 9_999_999_999 }));
    assert.equal(await readRecoveryToken(other, issuedAt), null);

    const rig = installAdmin(
      [{ id: "user-4", email: "ana@mapucoin.test", name: "Ana", appMetadata: { provider: "email" } }],
      { verifyAlways: true },
    );
    const box = mailBox();
    const sent = await requestPasswordReset(forgotRequest("ana@mapucoin.test", crypto.randomUUID()), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    assert.equal(sent.status, 200);
    const cookieToken = await plantRecoveryCookie(box.sent[0]?.html || "", rig.admin);
    assert.equal(cookieToken.includes("hash-"), false);
    assert.equal(rig.calls.verify.length, 0);

    const callback = await callbackGet(
      new Request(
        "https://mapucoin.com/auth/callback?type=recovery&token=secret-token&next=https://evil.example/phish",
        { headers: { host: "mapucoin.com", "x-forwarded-proto": "https" } },
      ),
    );
    assert.equal(callback.status, 303);
    const location = new URL(callback.headers.get("location") || "");
    assert.equal(location.origin, "https://mapucoin.com");
    assert.equal(location.pathname, UPDATE_PASSWORD_PATH);
    assert.equal(location.search, "");
    assert.equal(location.hash, "");
    assert.equal((callback.headers.get("location") || "").includes("secret-token"), false);
    assert.equal(
      callback.headers.getSetCookie().some((line) => line.includes("secret-token")),
      false,
    );

    const oldHash = hashPassword("oldpassword1");
    const vault = await signAccounts([
      { id: "user-4", email: "ana@mapucoin.test", name: "Ana", hash: oldHash },
    ]);
    const headers = {
      "content-type": "application/json",
      host: "mapucoin.com",
      "x-forwarded-proto": "https",
      "x-forwarded-for": crypto.randomUUID(),
      cookie: `${RECOVERY_COOKIE}=${encodeURIComponent(cookieToken)}; ${ACCOUNTS_COOKIE}=${vault}`,
    };
    const tooShort = await updateRecoveredPassword(
      new Request("https://mapucoin.com/api/auth/update-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ password: "short", confirm: "short" }),
      }),
      { admin: rig.admin, env: mailEnv },
    );
    assert.equal(tooShort.status, 400);
    assert.equal((await tooShort.json()).error, "password");
    assert.equal(rig.calls.update.length, 0);
    assert.equal(rig.calls.verify.length, 0);

    const mismatch = await updateRecoveredPassword(
      new Request("https://mapucoin.com/api/auth/update-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ password: "nueva-clave-8", confirm: "otra-clave-8" }),
      }),
      { admin: rig.admin, env: mailEnv },
    );
    assert.equal(mismatch.status, 400);
    assert.equal((await mismatch.json()).error, "mismatch");
    assert.equal(rig.calls.verify.length, 0);

    const ready = await inspectRecoveryRequest(
      new Request("https://mapucoin.com/api/auth/update-password", { headers }),
      { admin: rig.admin, env: mailEnv },
    );
    assert.equal(ready.status, 200);
    assert.equal(rig.calls.verify.length, 0);

    const saved = await updateRecoveredPassword(
      new Request("https://mapucoin.com/api/auth/update-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ password: "nueva-clave-8", confirm: "nueva-clave-8" }),
      }),
      { admin: rig.admin, env: mailEnv },
    );
    const savedBody = await saved.json();
    assert.equal(saved.status, 200);
    assert.deepEqual(savedBody, { ok: true, next: "/login" });
    assert.equal(rig.byId.get("user-4")?.password, "nueva-clave-8");
    assert.equal(rig.calls.update.length, 1);
    assert.equal(rig.calls.verify.length, 1);
    assert.deepEqual(rig.calls.revoke, ["access-jwt"]);
    assert.equal(rig.calls.clearJti, 1);
    const setCookies = saved.headers.getSetCookie();
    assert.ok(setCookies.some((line) => line.startsWith(`${RECOVERY_COOKIE}=`) && /Max-Age=0/.test(line)));
    assert.ok(setCookies.some((line) => line.startsWith("mapucoin_session=") && /Max-Age=0/.test(line)));
    const vaultLine = setCookies.find((line) => line.startsWith(`${ACCOUNTS_COOKIE}=`));
    assert.ok(vaultLine);
    const accounts = await readAccounts(cookieValue(vaultLine, ACCOUNTS_COOKIE));
    assert.equal(verifyPassword("nueva-clave-8", accounts[0]?.hash || ""), true);
    assert.equal(verifyPassword("oldpassword1", accounts[0]?.hash || ""), false);

    const again = await updateRecoveredPassword(
      new Request("https://mapucoin.com/api/auth/update-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ password: "otra-clave-99", confirm: "otra-clave-99" }),
      }),
      { admin: rig.admin, env: mailEnv },
    );
    assert.equal(again.status, 400);
    assert.equal((await again.json()).error, "token");
    assert.equal(rig.calls.update.length, 1);
    assert.equal(rig.byId.get("user-4")?.password, "nueva-clave-8");

    const queryToken = await callbackGet(
      new Request("https://mapucoin.com/auth/callback?type=recovery&token=nope&next=/admin", {
        headers: { host: "mapucoin.com", "x-forwarded-proto": "https" },
      }),
    );
    assert.equal(queryToken.status, 303);
    const dropped = new URL(queryToken.headers.get("location") || "");
    assert.equal(dropped.pathname, UPDATE_PASSWORD_PATH);
    assert.equal(dropped.search, "");
    assert.equal((queryToken.headers.get("location") || "").includes("nope"), false);
    assert.equal(
      queryToken.headers.getSetCookie().some((line) => line.startsWith(`${RECOVERY_COOKIE}=`)),
      false,
    );
  });

  it("leaves a Google marker hash untouched and still returns the user to login", async () => {
    const rig = installAdmin([
      { id: "user-5", email: "geo@mapucoin.test", name: "Geo", appMetadata: { provider: "google" } },
    ]);
    const box = mailBox();
    await requestPasswordReset(forgotRequest("geo@mapucoin.test", crypto.randomUUID()), {
      env: mailEnv,
      fetchImpl: box.fetchImpl,
      admin: rig.admin,
    });
    const cookieToken = await plantRecoveryCookie(box.sent[0]?.html || "", rig.admin);
    const vault = await signAccounts([
      { id: "user-5", email: "geo@mapucoin.test", name: "Geo", hash: GOOGLE_MARKER },
    ]);
    const saved = await updateRecoveredPassword(
      new Request("https://mapucoin.com/api/auth/update-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "mapucoin.com",
          "x-forwarded-proto": "https",
          "x-forwarded-for": crypto.randomUUID(),
          cookie: `${RECOVERY_COOKIE}=${encodeURIComponent(cookieToken)}; ${ACCOUNTS_COOKIE}=${vault}`,
        },
        body: JSON.stringify({ password: "nueva-clave-8", confirm: "nueva-clave-8" }),
      }),
      { admin: rig.admin, env: mailEnv },
    );
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).next, "/login");
    assert.equal(
      saved.headers.getSetCookie().some((line) => line.startsWith(`${ACCOUNTS_COOKIE}=`)),
      false,
    );
  });

  it("shows the forgot-password link and a logout control in the app header", () => {
    const auth = readFileSync("components/AuthForm.tsx", "utf8");
    const forgot = readFileSync("components/auth/ForgotPasswordForm.tsx", "utf8");
    const update = readFileSync("components/auth/UpdatePasswordForm.tsx", "utf8");
    const shell = readFileSync("components/app/AppShell.tsx", "utf8");
    const chip = readFileSync("components/AccountChip.tsx", "utf8");
    const frame = readFileSync("components/SiteFrame.tsx", "utf8");
    assert.match(auth, /href="\/recuperar"/);
    assert.match(auth, /a\.forgotLink/);
    assert.match(auth, /a\.linkExpired/);
    assert.match(forgot, /forgotSent/);
    assert.equal(forgot.includes("devUrl"), false);
    assert.match(update, /window\.location\.assign\("\/login"\)/);
    assert.match(update, /\/api\/auth\/recovery-session/);
    assert.match(update, /history\.replaceState/);
    assert.match(frame, /\/recuperar/);
    assert.match(frame, /\/auth/);
    assert.match(shell, /data-app-header/);
    assert.match(shell, /hidden md:block/);
    assert.match(shell, /md:hidden/);
    assert.match(chip, /data-app-logout/);
    assert.match(chip, /method: "POST"/);
    const logout = readFileSync("app/api/auth/logout/route.ts", "utf8");
    assert.match(logout, /export async function POST/);
    assert.equal(/export async function GET/.test(logout), false);
    const verifyScreen = readFileSync("components/auth/VerifyEmailScreen.tsx", "utf8");
    assert.match(verifyScreen, /method: "POST"/);
    assert.equal(verifyScreen.includes("/api/auth/logout?next="), false);
    const buttonAt = chip.indexOf("data-app-logout");
    const button = chip.slice(buttonAt, chip.indexOf("</button>", buttonAt));
    assert.equal(/\bhidden\b/.test(button), false);
    assert.match(button, /shrink-0/);
    assert.match(button, /whitespace-nowrap/);
    const cleared = clearAuthCookieHeaders(null);
    assert.ok(
      cleared.some((line) => line.startsWith(`${RECOVERY_COOKIE}=`) && /Max-Age=0/.test(line)),
    );
    const routes = [
      readFileSync("app/api/auth/forgot-password/route.ts", "utf8"),
      readFileSync("app/api/auth/update-password/route.ts", "utf8"),
      readFileSync("app/api/auth/recovery-session/route.ts", "utf8"),
    ];
    for (const route of routes) {
      assert.match(route, /export const runtime = "nodejs"/);
      assert.equal(route.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), false);
      assert.equal(route.includes("devUrl"), false);
    }
  });

  it("still sends a code-less auth callback through the Google failure path", async () => {
    const res = await callbackGet(new Request("https://mapucoin.com/auth/callback"));
    assert.equal(res.status, 307);
    const location = new URL(res.headers.get("location") || "");
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("auth"), "google");
  });
});
