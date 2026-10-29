import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  mpEnabled,
  mpManifest,
  mpMarketplaceFeeClp,
  mpPreferenceBody,
  readOauthState,
  signOauthState,
  verifyMpSignature,
} from "@/lib/mp";

const secret = "test-secret-not-real";
const sign = (m: string) => createHmac("sha256", secret).update(m).digest("hex");

test("manifest follows the documented template", () => {
  assert.equal(mpManifest("123456", "req-1", "1704908010"), "id:123456;request-id:req-1;ts:1704908010;");
  assert.equal(mpManifest("ABC123", "", "1"), "id:abc123;ts:1;");
});

test("valid x-signature passes, tampered fails", () => {
  const ts = "1704908010";
  const v1 = sign(mpManifest("999999999", "abc-req", ts));
  const base = { xRequestId: "abc-req", dataId: "999999999", secret };
  assert.equal(verifyMpSignature({ ...base, xSignature: `ts=${ts},v1=${v1}` }), true);
  assert.equal(verifyMpSignature({ ...base, xSignature: `ts=${ts},v1=${v1.replace(/.$/, "0") === v1 ? v1.replace(/.$/, "1") : v1.replace(/.$/, "0")}` }), false);
  assert.equal(verifyMpSignature({ ...base, dataId: "1", xSignature: `ts=${ts},v1=${v1}` }), false);
  assert.equal(verifyMpSignature({ ...base, secret: "other", xSignature: `ts=${ts},v1=${v1}` }), false);
  assert.equal(verifyMpSignature({ ...base, xSignature: "" }), false);
  assert.equal(verifyMpSignature({ ...base, secret: undefined, xSignature: `ts=${ts},v1=${v1}` }), false);
  assert.equal(
    verifyMpSignature({ ...base, xSignature: `ts=${ts},v1=${v1}`, toleranceSeconds: 300, nowMs: Number(ts) * 1000 + 600_000 }),
    false,
  );
});

test("marketplace fee is 12% in CLP integers; partner gets 88%", () => {
  assert.equal(mpMarketplaceFeeClp(100000), 12000);
  assert.equal(100000 - mpMarketplaceFeeClp(100000), 88000);
  assert.equal(mpMarketplaceFeeClp(85990), 10319);
  assert.equal(mpMarketplaceFeeClp(1), 0);
  assert.equal(Number.isInteger(mpMarketplaceFeeClp(12345)), true);
});

test("preference body uses CLP and marketplace_fee", () => {
  const b = mpPreferenceBody({
    bookingId: "b1", title: "t", description: "d", amount: 150000, payerEmail: undefined,
    successUrl: "https://x/s", failureUrl: "https://x/f", notificationUrl: "https://x/api/mp/webhook",
  });
  assert.equal(b.items[0].currency_id, "CLP");
  assert.equal(b.items[0].unit_price, 150000);
  assert.equal(b.marketplace_fee, 18000);
  assert.equal(b.external_reference, "b1");
  assert.equal("payer" in b, false);
});

test("flag is off in production and without credentials", () => {
  const env = { PAYMENTS_PROVIDER: "mp", MP_ACCESS_TOKEN: "x", MP_CLIENT_ID: "y", MP_CLIENT_SECRET: "z" };
  assert.equal(mpEnabled({ ...env, VERCEL_ENV: "preview" }), true);
  assert.equal(mpEnabled({ ...env, VERCEL_ENV: "production" }), false);
  assert.equal(mpEnabled({ ...env, PAYMENTS_PROVIDER: "stripe", VERCEL_ENV: "preview" }), false);
  assert.equal(mpEnabled({ PAYMENTS_PROVIDER: "mp", VERCEL_ENV: "preview" }), false);
});

test("oauth state is signed", () => {
  const s = signOauthState("partner-1", secret);
  assert.equal(readOauthState(s, secret), "partner-1");
  assert.equal(readOauthState(s, "other"), null);
  assert.equal(readOauthState(s.replace("partner-1", "partner-2"), secret), null);
});

test("is_test partners are never public", async () => {
  const { isTestPartner } = await import("@/lib/partner-store");
  assert.equal(isTestPartner({ is_test: true, status: "approved" }), true);
  assert.equal(isTestPartner({ is_test: false }), false);
  assert.equal(isTestPartner({}), false);
  assert.equal(isTestPartner(null), false);
  const { publicPartners } = await import("@/lib/partners").catch(() => ({ publicPartners: undefined }));
  void publicPartners;
});

test("listApprovedPublic drops is_test rows and the query filters is_test=false", async () => {
  const { listApprovedPublic } = await import("@/lib/partner-store");
  const calls: string[] = [];
  const rows = [
    { id: "a", status: "approved", is_test: false, slug: "real", business: "Real", city: "X", role: "capsula" },
    { id: "t", status: "approved", is_test: true, slug: "test", business: "Partner Prueba MP (sandbox)", city: "X", role: "capsula" },
  ];
  const q: Record<string, unknown> = {};
  const chain = {
    select: () => chain,
    order: () => chain,
    limit: () => chain,
    eq: (col: string, val: unknown) => { calls.push(`${col}=${val}`); return chain; },
    then: (ok: (v: unknown) => unknown) => ok({ data: rows, error: null }),
  };
  Object.assign(q, chain);
  const db = { from: () => chain } as never;
  const out = await listApprovedPublic(db);
  assert.ok(calls.includes("is_test=false"));
  assert.equal(out.some((p: { business?: string }) => /Prueba MP/.test(String(p.business))), false);
});
