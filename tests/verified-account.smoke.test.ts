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
import { POST as signupPost } from "../app/api/auth/signup/route.ts";
import { POST as verifyPost } from "../app/api/auth/verify-email/route.ts";
import { at } from "../lib/app-copy.ts";
import { t } from "../lib/copy.ts";
import {
  createEmailVerifyToken,
  grantVerifiedEmail,
  readEmailVerifyToken,
  verificationLinkExposed,
} from "../lib/email-verification.ts";
import {
  createSessionToken,
  readSession,
  SESSION_COOKIE,
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
    assert.equal(pageGateTarget("/verificar", "", null)?.startsWith("/signup?"), true);
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
});
