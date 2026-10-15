import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { GET as catalogGet } from "../app/api/catalog/route.ts";
import { POST as chatPost } from "../app/api/chat/route.ts";
import { POST as checkoutPost } from "../app/api/checkout/route.ts";
import {
  GET as confirmGet,
  POST as confirmPost,
} from "../app/api/checkout/confirm/route.ts";
import { GET as bookingsGet } from "../app/api/bookings/route.ts";
import { GET as healthGet } from "../app/api/health/route.ts";
import { POST as partnersPost } from "../app/api/partners/route.ts";
import { GET as approvedGet } from "../app/api/partners/approved/route.ts";
import { POST as connectPost } from "../app/api/partners/connect/route.ts";
import { POST as planPost } from "../app/api/plan/route.ts";
import { GET as premiumGet, POST as premiumPost } from "../app/api/premium/route.ts";
import { GET as profileGet, PUT as profilePut } from "../app/api/profile/route.ts";
import { GET as logoutGet, POST as logoutPost } from "../app/api/auth/logout/route.ts";
import { POST as loginPost } from "../app/api/auth/login/route.ts";
import { GET as meGet } from "../app/api/auth/me/route.ts";
import { POST as signupPost } from "../app/api/auth/signup/route.ts";
import { POST as verifyPost } from "../app/api/auth/verify-email/route.ts";
import {
  accountVerificationState,
  persistVerifiedAccountByEmail,
  VERIFICATION_GATE_AT,
} from "../lib/account-verification.ts";
import { hashPassword } from "../lib/passwords.ts";
import { at } from "../lib/app-copy.ts";
import { t } from "../lib/copy.ts";
import {
  createEmailVerifyToken,
  grantVerifiedEmail,
  readEmailVerifyToken,
  requestOrigin,
  verificationLinkExposed,
  verificationUrl,
} from "../lib/email-verification.ts";
import { partnerDelivery } from "../lib/partner-delivery.ts";
import { loginPathFromVerify } from "../lib/service-redirect.ts";
import {
  ACCOUNTS_COOKIE,
  createSessionToken,
  readSession,
  SESSION_COOKIE,
  signAccounts,
  signValue,
  type SessionUser,
} from "../lib/session.ts";
import { pageGateTarget, SERVICE_API_ROUTES } from "../lib/verified-access.ts";
import { verifyMailFeedback } from "../lib/verify-feedback.ts";

const verified: SessionUser = {
  id: "verified-user",
  email: "verified@mapucoin.test",
  name: "Vera",
  emailVerified: true,
};

const unverified: SessionUser = {
  id: "unverified-user",
  email: "new@mapucoin.test",
  name: "Nico",
  emailVerified: false,
};

type Handler = (req: Request) => Promise<Response> | Response;

const handlers: Record<(typeof SERVICE_API_ROUTES)[number], Handler> = {
  "POST /api/checkout": checkoutPost,
  "GET /api/checkout/confirm": confirmGet,
  "POST /api/checkout/confirm": confirmPost,
  "POST /api/plan": planPost,
  "POST /api/chat": chatPost,
  "POST /api/partners": partnersPost,
  "POST /api/partners/connect": connectPost,
  "GET /api/bookings": bookingsGet,
  "GET /api/profile": profileGet,
  "PUT /api/profile": profilePut,
  "GET /api/premium": premiumGet,
  "POST /api/premium": premiumPost,
};

function bodyFor(route: string) {
  if (route === "POST /api/partners") {
    return {
      full_name: "Ana Ruiz",
      email: "ana@mapucoin.test",
      role: "capsula",
      business: "Domo Sur",
      city: "Pucón",
    };
  }
  if (route === "PUT /api/profile") {
    return { fullName: "Vera Viajera", email: "verified@mapucoin.test" };
  }
  if (route === "POST /api/plan") return { lugar: "san-pedro-de-atacama" };
  if (route.startsWith("POST ") || route.startsWith("PUT ")) return {};
  return undefined;
}

async function cookieFor(user: SessionUser) {
  return `${SESSION_COOKIE}=${await createSessionToken(user)}`;
}

async function call(route: (typeof SERVICE_API_ROUTES)[number], cookie?: string) {
  const [method, path] = route.split(" ");
  const body = bodyFor(route);
  const res = await handlers[route](
    new Request(`http://localhost${path}`, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  );
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return { status: res.status, data };
}

describe("verified account gate", () => {
  it("keeps marketing pages public and gates service pages", () => {
    for (const path of [
      "/",
      "/mapa",
      "/destinos",
      "/capsulas",
      "/gastronomia",
      "/actividades",
      "/partners",
      "/partners/domo-sur",
      "/terminos",
      "/privacidad",
      "/login",
      "/signup",
    ]) {
      assert.equal(pageGateTarget(path, "", null), null, path);
    }

    assert.equal(
      pageGateTarget("/reserva", "?capsula=domo", null),
      `/login?next=${encodeURIComponent("/reserva?capsula=domo")}`,
    );
    assert.match(
      pageGateTarget("/app/viaje", "", unverified) || "",
      /^\/verificar\?next=/,
    );
    assert.equal(pageGateTarget("/app", "", verified), null);
    assert.match(pageGateTarget("/partners/onboard", "", null) || "", /^\/login\?/);
    assert.match(pageGateTarget("/planificar", "", null) || "", /^\/login\?/);
    assert.equal(pageGateTarget("/verificar", "", null)?.startsWith("/login?"), true);
    assert.equal(pageGateTarget("/verificar", "?next=/reserva", verified), "/reserva");
    assert.equal(pageGateTarget("/verificar", "", unverified), null);
  });

  it("treats sessions minted before verification as unverified", async () => {
    const legacy = await signValue(
      JSON.stringify({
        id: "legacy",
        email: "legacy@mapucoin.test",
        name: "Legacy",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
    const user = await readSession(legacy);
    assert.equal(user?.emailVerified, false);
    assert.equal((await readSession(await createSessionToken(verified)))?.emailVerified, true);
  });

  it("rejects expired verification tokens and upgrades a matching session", async () => {
    const expired = await signValue(
      JSON.stringify({
        kind: "email-verify",
        email: "new@mapucoin.test",
        exp: Math.floor(Date.now() / 1000) - 10,
      }),
    );
    assert.equal(await readEmailVerifyToken(expired), null);

    const token = await createEmailVerifyToken(unverified.email);
    const cookie = await cookieFor(unverified);
    const granted = await grantVerifiedEmail({
      email: unverified.email,
      cookieHeader: cookie,
    });
    assert.equal(granted.mismatch, false);
    assert.equal(granted.user?.emailVerified, true);

    const other = await grantVerifiedEmail({
      email: "other@mapucoin.test",
      cookieHeader: cookie,
    });
    assert.equal(other.mismatch, true);

    const consumed = await verifyPost(
      new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: {
          cookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({ token }),
      }),
    );
    const consumedBody = (await consumed.json()) as { emailVerified?: boolean };
    assert.equal(consumed.status, 200);
    assert.equal(consumedBody.emailVerified, true);
  });

  it("hides the verification link in production unless the tester flag is on", () => {
    assert.equal(
      verificationLinkExposed({ NODE_ENV: "production", VERCEL_ENV: "production" }),
      false,
    );
    assert.equal(
      verificationLinkExposed({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        MAPUCOIN_DEV_VERIFY: "1",
      }),
      true,
    );
    assert.equal(verificationLinkExposed({ NODE_ENV: "test" }), true);
    assert.equal(
      verificationLinkExposed({ NODE_ENV: "production", VERCEL_ENV: "preview" }),
      true,
    );
    assert.match(
      readFileSync("lib/email-verification.ts", "utf8"),
      /\["MAPUCOIN_DEV_VERIFY"\]/,
    );
  });

  it("blocks guests and unverified accounts on every service endpoint and allows verified accounts", async () => {
    const unverifiedCookie = await cookieFor(unverified);
    const verifiedCookie = await cookieFor(verified);

    for (const route of SERVICE_API_ROUTES) {
      const guest = await call(route);
      assert.equal(guest.status, 401, route);
      assert.equal(guest.data.error, "auth", route);

      const pending = await call(route, unverifiedCookie);
      assert.equal(pending.status, 403, route);
      assert.equal(pending.data.error, "email_unverified", route);

      const allowed = await call(route, verifiedCookie);
      assert.notEqual(allowed.status, 401, route);
      assert.notEqual(allowed.status, 403, route);
    }

    const plan = await call("POST /api/plan", verifiedCookie);
    assert.equal(plan.status, 200);
  });

  it("leaves public catalog, health, and approved partners readable without a session", async () => {
    const catalog = await catalogGet();
    assert.equal(catalog.status, 200);
    const catalogBody = (await catalog.json()) as { capsules?: unknown[] };
    assert.ok((catalogBody.capsules || []).length > 0);

    const health = await healthGet();
    assert.equal(health.status, 200);

    const approved = await approvedGet();
    assert.equal(approved.status, 200);
    const approvedBody = (await approved.json()) as { partners?: unknown[] };
    assert.ok(Array.isArray(approvedBody.partners));
  });

  it("does not put the account gate on Stripe webhooks or the public partner map", () => {
    const webhook = readFileSync("app/api/stripe/webhook/route.ts", "utf8");
    const refresh = readFileSync("app/api/partners/connect/refresh/route.ts", "utf8");
    const approved = readFileSync("app/api/partners/approved/route.ts", "utf8");
    const checkout = readFileSync("app/api/checkout/route.ts", "utf8");
    for (const source of [webhook, refresh, approved]) {
      assert.equal(source.includes("requireVerifiedAccount"), false);
    }
    assert.match(checkout, /application_fee_amount/);
    assert.match(checkout, /requireVerifiedAccount/);
  });

  it("explains in Spanish that registration personalizes the experience", () => {
    const es = t("es");
    const copy = at("es");
    assert.match(es.plan.lead, /experiencia personalizada/);
    assert.match(es.plan.formLead, /cuenta verificada/);
    assert.match(es.partners.lead, /correo verificado/);
    assert.match(es.partners.onboardLead, /cuenta verificada/);
    assert.match(copy.signupPersonalized, /experiencia personalizada/);
    assert.match(copy.verifyLead, /personalizar el viaje/);
    assert.equal(copy.verifyResend, "Reenviar correo");
    assert.match(copy.verifyNotSent, /No pudimos enviar el correo de verificación/);
    assert.match(copy.verifySent, /Correo enviado/);
    assert.match(copy.verifyWait, /Espera \{n\} segundos/);
  });

  it("accepts name as an alias of full_name on signup", async () => {
    async function signup(body: Record<string, unknown>) {
      const res = await signupPost(
        new Request("http://localhost/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const data = (await res.json()) as {
        error?: string;
        delivered?: boolean;
        user?: { name?: string; emailVerified?: boolean };
      };
      return { status: res.status, data };
    }

    const byName = await signup({
      name: "Ana Ruiz",
      email: "ana-name@mapucoin.test",
      password: "supersecret",
    });
    assert.equal(byName.status, 200);
    assert.equal(byName.data.error, undefined);
    assert.equal(byName.data.user?.name, "Ana Ruiz");
    assert.equal(byName.data.user?.emailVerified, false);
    assert.equal(byName.data.delivered, false);

    const byFull = await signup({
      full_name: "Ana Ruiz",
      email: "ana-full@mapucoin.test",
      password: "supersecret",
    });
    assert.equal(byFull.status, 200);
    assert.equal(byFull.data.user?.name, "Ana Ruiz");

    const missing = await signup({
      email: "missing-name@mapucoin.test",
      password: "supersecret",
    });
    assert.equal(missing.status, 400);
    assert.equal(missing.data.error, "name");
  });

  it("tells the verify screen when mail was not sent and how long to wait", async () => {
    const failed = verifyMailFeedback({ delivered: false, httpStatus: 200 });
    assert.equal(failed.failed, true);
    assert.equal(failed.sent, false);
    assert.equal(failed.canResend, true);

    const waiting = verifyMailFeedback({
      delivered: false,
      httpStatus: 200,
      retryAfter: 20,
    });
    assert.equal(waiting.failed, true);
    assert.equal(waiting.waitSeconds, 20);
    assert.equal(waiting.canResend, false);
    assert.equal(
      verifyMailFeedback({ delivered: false, retryAfter: 0 }).canResend,
      true,
    );

    const sent = verifyMailFeedback({ delivered: true, httpStatus: 200, retryAfter: 20 });
    assert.equal(sent.sent, true);
    assert.equal(sent.failed, false);
    assert.equal(sent.waitSeconds, 20);

    const cookie = await cookieFor(unverified);
    const first = await verifyPost(
      new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ next: "/reserva" }),
      }),
    );
    const firstBody = (await first.json()) as { delivered?: boolean; retryAfter?: number };
    assert.equal(first.status, 200);
    assert.equal(firstBody.delivered, false);
    assert.ok((firstBody.retryAfter || 0) > 0);

    const second = await verifyPost(
      new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ next: "/reserva" }),
      }),
    );
    const secondBody = (await second.json()) as { retryAfter?: number; delivered?: boolean };
    assert.equal(second.status, 429);
    assert.equal(secondBody.delivered, false);
    assert.ok((secondBody.retryAfter || 0) >= 1);
  });

  it("builds verification links from the current deployment, never the baked-in production domain", () => {
    const previewHeaders = {
      "x-forwarded-host": "mapucoin-git-preview.vercel.app",
      "x-forwarded-proto": "https",
      host: "mapucoin.com",
    };
    const previewReq = new Request("https://mapucoin.com/api/auth/signup", {
      headers: previewHeaders,
    });
    const env = (extra: Record<string, string | undefined>) =>
      ({ ...process.env, ...extra }) as NodeJS.ProcessEnv;
    assert.equal(
      requestOrigin(
        previewReq,
        env({
          NEXT_PUBLIC_APP_URL: "https://mapucoin.com",
          VERCEL_ENV: "preview",
          VERCEL_URL: "mapucoin-abc123.vercel.app",
        }),
      ),
      "https://mapucoin-git-preview.vercel.app",
    );
    assert.equal(
      requestOrigin(
        new Request("https://mapucoin.com/api/auth/signup", {
          headers: { "x-forwarded-host": "mapucoin.com", "x-forwarded-proto": "https" },
        }),
        env({
          NEXT_PUBLIC_APP_URL: "https://mapucoin.com",
          VERCEL_ENV: "preview",
          VERCEL_URL: "mapucoin-abc123.vercel.app",
        }),
      ),
      "https://mapucoin-abc123.vercel.app",
    );
    assert.equal(
      requestOrigin(
        new Request("https://mapucoin.com/api/auth/signup"),
        env({
          NEXT_PUBLIC_APP_URL: "https://mapucoin.com",
          VERCEL_URL: "mapucoin-abc123.vercel.app",
        }),
      ),
      "https://mapucoin-abc123.vercel.app",
    );
    assert.equal(
      requestOrigin(
        new Request("https://mapucoin.com/api/auth/signup"),
        env({ NEXT_PUBLIC_APP_URL: "https://mapucoin.com", VERCEL_URL: "" }),
      ),
      "http://127.0.0.1:3000",
    );
    assert.equal(
      requestOrigin(
        new Request("https://mapucoin.com/api/auth/signup", {
          headers: { host: "mapucoin.com", "x-forwarded-proto": "https" },
        }),
        env({ VERCEL_ENV: "production", NEXT_PUBLIC_APP_URL: "https://example.test" }),
      ),
      "https://mapucoin.com",
    );

    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://mapucoin.com";
    try {
      const link = verificationUrl(previewReq, "tok", "/reserva?capsula=domo");
      assert.match(
        link,
        /^https:\/\/mapucoin-git-preview\.vercel\.app\/api\/auth\/verify-email\?/,
      );
      assert.equal(link.includes("https://mapucoin.com"), false);
      const parsed = new URL(link);
      assert.equal(parsed.searchParams.get("next"), "/reserva?capsula=domo");
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = previous;
    }
  });

  it("returns a preview verify link from signup when the request host is the deployment", async () => {
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://mapucoin.com";
    try {
      const res = await signupPost(
        new Request("https://mapucoin.com/api/auth/signup", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-host": "mapucoin-git-preview.vercel.app",
            "x-forwarded-proto": "https",
          },
          body: JSON.stringify({
            name: "Ana Preview",
            email: "preview-link@mapucoin.test",
            password: "supersecret",
          }),
        }),
      );
      const data = (await res.json()) as { devUrl?: string };
      assert.equal(res.status, 200);
      assert.match(
        data.devUrl || "",
        /^https:\/\/mapucoin-git-preview\.vercel\.app\/api\/auth\/verify-email\?/,
      );
      assert.equal((data.devUrl || "").includes("mapucoin.com"), false);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = previous;
    }
  });

  it("preserves the original next when /verificar has no session", () => {
    const reserva = "/reserva?capsula=domo";
    const search = `?next=${encodeURIComponent(reserva)}`;
    assert.equal(
      pageGateTarget("/verificar", search, null),
      `/login?next=${encodeURIComponent(reserva)}`,
    );
    assert.equal(
      loginPathFromVerify(search),
      `/login?next=${encodeURIComponent(reserva)}`,
    );
    const absolute = `?next=${encodeURIComponent(`https://mapucoin-git-x.vercel.app${reserva}`)}`;
    assert.equal(
      pageGateTarget("/verificar", absolute, null),
      `/login?next=${encodeURIComponent(reserva)}`,
    );
    assert.equal(pageGateTarget("/verificar", "", null), "/login?next=%2Fapp");
  });

  it("clears session and verification cookies on logout and drops the session", async () => {
    const cookie = [
      await cookieFor(unverified),
      "mapucoin_verified=signed",
      "mapucoin_profiles=signed",
      "mapucoin_oauth=signed",
      "sb-preview-auth-token=supabase-session",
    ].join("; ");
    const before = await meGet(
      new Request("http://localhost/api/auth/me", { headers: { cookie } }),
    );
    assert.equal(((await before.json()) as { user?: { email?: string } }).user?.email, unverified.email);

    const res = await logoutPost(
      new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: { cookie, host: "localhost:3000" },
      }),
    );
    const cleared = res.headers.getSetCookie();
    for (const name of [
      "mapucoin_session",
      "mapucoin_verified",
      "mapucoin_profiles",
      "mapucoin_oauth",
      "sb-preview-auth-token",
    ]) {
      assert.ok(
        cleared.some((line) => line.startsWith(`${name}=`) && /Max-Age=0/i.test(line)),
        name,
      );
    }
    const jar = new Map<string, string>();
    for (const part of cookie.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      jar.set(name, rest.join("="));
    }
    for (const line of cleared) {
      if (!/Max-Age=0/i.test(line)) continue;
      const name = line.split("=")[0];
      jar.delete(name);
    }
    const after = await meGet(
      new Request("http://localhost/api/auth/me", {
        headers: { cookie: [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ") },
      }),
    );
    assert.equal(((await after.json()) as { user: unknown }).user, null);

    const next = `/login?next=${encodeURIComponent("/reserva?capsula=domo")}`;
    const leave = await logoutGet(
      new Request(`https://mapucoin.com/api/auth/logout?next=${encodeURIComponent(next)}`, {
        headers: {
          cookie,
          "x-forwarded-host": "mapucoin-git-preview.vercel.app",
          "x-forwarded-proto": "https",
        },
      }),
    );
    assert.equal(leave.status, 303);
    assert.equal(
      leave.headers.get("location"),
      `https://mapucoin-git-preview.vercel.app${next}`,
    );
  });

  it("lets an unverified visitor leave /verificar and keeps login errors visible", () => {
    const screen = readFileSync("components/auth/VerifyEmailScreen.tsx", "utf8");
    assert.match(screen, /\/api\/auth\/logout\?next=/);
    assert.match(screen, /account\.logout/);
    assert.match(screen, /disabled=\{!hydrated\}/);
    assert.match(screen, /loginPathFromVerify/);
    assert.match(screen, /linkOnly: true/);
    assert.equal(at("es").account.logout, "Salir");
    assert.match(at("es").verifyLegacy, /anterior a la verificación/);
    assert.doesNotMatch(screen, /signupPathFromVerify/);
    const auth = readFileSync("components/AuthForm.tsx", "utf8");
    assert.match(auth, /setHydrated\(true\)/);
    assert.match(auth, /disabled=\{!hydrated/);
    assert.match(auth, /role="alert"/);
    assert.match(auth, /a\.loginError/);
    assert.match(auth, /a\.authWait/);
  });

  it("prefills booking and partner identity and does not default the partner city", () => {
    assert.equal(t("es").partners.cityPlaceholder, "Elige tu ciudad");
    const partners = readFileSync("components/PartnersForm.tsx", "utf8");
    const reserva = readFileSync("app/reserva/page.tsx", "utf8");
    assert.match(partners, /useSessionIdentity/);
    assert.match(reserva, /useSessionIdentity/);
    assert.match(partners, /cityPlaceholder/);
    assert.match(partners, /value=""/);
    assert.equal(partners.includes('value="Putre"'), false);
    assert.equal(partners.includes("defaultValue=\"Putre\""), false);
  });

  it("does not store or notify partner applications outside production", async () => {
    const deliveryEnv = (vercel: string | undefined) =>
      ({ ...process.env, VERCEL_ENV: vercel }) as NodeJS.ProcessEnv;
    assert.equal(partnerDelivery(deliveryEnv("preview")).store, false);
    assert.equal(partnerDelivery(deliveryEnv("preview")).notify, false);
    assert.equal(partnerDelivery(deliveryEnv("production")).store, true);
    assert.equal(partnerDelivery(deliveryEnv("production")).notify, false);
    assert.equal(partnerDelivery(deliveryEnv(undefined)).preview, true);
    const source = readFileSync("app/api/partners/route.ts", "utf8");
    assert.equal(/slack|resend|webhook/i.test(source), false);

    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "preview";
    try {
      const res = await partnersPost(
        new Request("http://localhost/api/partners", {
          method: "POST",
          headers: {
            cookie: await cookieFor(verified),
            "content-type": "application/json",
            host: "localhost:3000",
          },
          body: JSON.stringify({
            full_name: "Ana Ruiz",
            email: "ana@mapucoin.test",
            role: "capsula",
            business: "Domo Sur",
            city: "Pucón",
          }),
        }),
      );
      const body = (await res.json()) as {
        ok?: boolean;
        stored?: boolean;
        preview?: boolean;
        notified?: boolean;
      };
      assert.equal(res.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.stored, false);
      assert.equal(body.preview, true);
      assert.equal(body.notified, false);
    } finally {
      if (previous === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = previous;
    }
  });

  it("keeps verification on the account after logout clears the verification cookie", async () => {
    const password = "supersecret";
    const account = {
      id: "mpc-e2e",
      email: "mpc-e2e@mapucoin.test",
      name: "MPC",
      hash: hashPassword(password),
      emailVerified: true as const,
    };
    const vault = `${ACCOUNTS_COOKIE}=${await signAccounts([account])}`;
    async function login(cookie: string) {
      const res = await loginPost(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json", cookie },
          body: JSON.stringify({ email: account.email, password }),
        }),
      );
      const data = (await res.json()) as {
        user?: { emailVerified?: boolean; legacyVerification?: boolean };
      };
      return { status: res.status, data, cookies: res.headers.getSetCookie() };
    }

    const first = await login(vault);
    assert.equal(first.status, 200);
    assert.equal(first.data.user?.emailVerified, true);
    assert.equal(first.data.user?.legacyVerification, false);

    const session = first.cookies.find((line) => line.startsWith("mapucoin_session="));
    const loggedOut = await logoutPost(
      new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: {
          cookie: `${vault}; ${session?.split(";")[0] || ""}; mapucoin_verified=stale`,
        },
      }),
    );
    const cleared = loggedOut.headers.getSetCookie();
    assert.equal(
      cleared.some((line) => line.startsWith("mapucoin_accounts=") && /Max-Age=0/i.test(line)),
      false,
    );
    assert.ok(
      cleared.some((line) => line.startsWith("mapucoin_verified=") && /Max-Age=0/i.test(line)),
    );

    const again = await login(vault);
    assert.equal(again.status, 200);
    assert.equal(again.data.user?.emailVerified, true);
  });

  it("stores verification on the account and does not bulk-flag older users", async () => {
    const before = new Date(Date.parse(VERIFICATION_GATE_AT) - 86_400_000).toISOString();
    const after = new Date(Date.parse(VERIFICATION_GATE_AT) + 86_400_000).toISOString();

    assert.deepEqual(
      accountVerificationState({ serverVerified: true, vaultVerified: false, createdAt: before }),
      { emailVerified: true, legacy: false },
    );
    assert.deepEqual(
      accountVerificationState({ serverVerified: null, vaultVerified: null, createdAt: before }),
      { emailVerified: false, legacy: true },
    );
    assert.deepEqual(
      accountVerificationState({ serverVerified: false, createdAt: before }),
      { emailVerified: false, legacy: false },
    );
    assert.deepEqual(
      accountVerificationState({ serverVerified: null, vaultVerified: null, createdAt: after }),
      { emailVerified: false, legacy: false },
    );
    assert.deepEqual(
      accountVerificationState({ google: true, serverVerified: null, createdAt: before }),
      { emailVerified: true, legacy: false },
    );
    assert.deepEqual(
      accountVerificationState({ vaultVerified: true, serverVerified: null }),
      { emailVerified: true, legacy: false },
    );

    const legacy = {
      id: "legacy-account",
      email: "legacy-account@mapucoin.test",
      name: "Legacy",
      hash: hashPassword("supersecret"),
    };
    const res = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `${ACCOUNTS_COOKIE}=${await signAccounts([legacy])}`,
        },
        body: JSON.stringify({ email: legacy.email, password: "supersecret" }),
      }),
    );
    const data = (await res.json()) as {
      user?: { emailVerified?: boolean; legacyVerification?: boolean };
    };
    assert.equal(res.status, 200);
    assert.equal(data.user?.emailVerified, false);
    assert.equal(data.user?.legacyVerification, true);

    const calls: { url: string; body?: string; method?: string }[] = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const href = String(url);
      calls.push({ url: href, body: init?.body ? String(init.body) : undefined, method: init?.method });
      if (href.includes("filter=")) {
        return new Response(
          JSON.stringify({
            users: [
              {
                id: "user-1",
                email: "mpc-e2e@mapucoin.test",
                user_metadata: { full_name: "MPC" },
              },
            ],
          }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    const saved = await persistVerifiedAccountByEmail(
      "mpc-e2e@mapucoin.test",
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      } as unknown as NodeJS.ProcessEnv,
      fetchImpl,
    );
    assert.equal(saved, true);
    assert.equal(calls[1]?.method, "PUT");
    assert.match(calls[1]?.body || "", /"mapucoin_email_verified":true/);
    assert.match(calls[1]?.body || "", /"full_name":"MPC"/);
    assert.equal(
      await persistVerifiedAccountByEmail("mpc-e2e@mapucoin.test", {} as NodeJS.ProcessEnv, fetchImpl),
      false,
    );

    const previousVercel = process.env.VERCEL_ENV;
    const previousFlag = process.env.MAPUCOIN_DEV_VERIFY;
    process.env.VERCEL_ENV = "preview";
    delete process.env.MAPUCOIN_DEV_VERIFY;
    try {
      const link = await verifyPost(
        new Request("http://localhost/api/auth/verify-email", {
          method: "POST",
          headers: {
            cookie: await cookieFor(unverified),
            "content-type": "application/json",
            host: "localhost:3000",
          },
          body: JSON.stringify({ linkOnly: true, next: "/reserva" }),
        }),
      );
      const linkBody = (await link.json()) as { devUrl?: string };
      assert.equal(link.status, 200);
      assert.match(linkBody.devUrl || "", /\/api\/auth\/verify-email\?/);
    } finally {
      if (previousVercel === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = previousVercel;
      if (previousFlag === undefined) delete process.env.MAPUCOIN_DEV_VERIFY;
      else process.env.MAPUCOIN_DEV_VERIFY = previousFlag;
    }
  });
});
