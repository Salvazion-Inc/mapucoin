import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  applyMpPaymentForBooking,
  checkMpPayment,
  handleMpPaymentNotification,
  processMpEvent,
  type Db,
} from "@/lib/mp-payments";
import { mpManifest, mpOrigin, verifyMpSignature } from "@/lib/mp";
import { decryptToken, encryptToken } from "@/lib/mp-crypto";
import { randomBytes } from "node:crypto";

process.env.MP_TOKEN_KEY = randomBytes(32).toString("base64");
const enc = (t: string) => {
  const e = encryptToken(t);
  return { access_token_enc: e.enc, key_version: e.version };
};

const booking = {
  id: "f20f0668-9bc5-4e36-8373-daf41f34bbb9",
  status: "checkout",
  amount: "10000",
  application_fee_clp: 1200,
  partner_id: "partner-1",
  mp_payment_id: null as string | null,
};
const account = { partner_id: "partner-1", mp_user_id: "3801947630", ...enc("tok-partner-1") };
const payment = (over: Record<string, unknown> = {}) => ({
  id: 187651313678,
  status: "approved",
  external_reference: booking.id,
  transaction_amount: 10000,
  currency_id: "CLP",
  collector_id: 3801947630,
  fee_details: [
    { type: "mercadopago_fee", amount: 380 },
    { type: "application_fee", amount: 1200 },
  ],
  ...over,
});

/** Tiny in-memory fake of the supabase-js query builder used by lib/mp-payments. */
function fakeDb(tables: Record<string, Record<string, unknown>[]>) {
  const log: string[] = [];
  const db: Db = {
    from(table: string) {
      const rows = (tables[table] ||= []);
      let filters: [string, unknown, boolean][] = [];
      let op: "select" | "update" | "delete" = "select";
      let patch: Record<string, unknown> = {};
      const match = (r: Record<string, unknown>) =>
        filters.every(([k, v, neg]) => (neg ? r[k] !== v : r[k] === v));
      const q: Record<string, unknown> = {
        select: () => q,
        eq: (k: string, v: unknown) => ((filters = [...filters, [k, v, false]]), q),
        neq: (k: string, v: unknown) => ((filters = [...filters, [k, v, true]]), q),
        maybeSingle: async () => ({ data: rows.find(match) || null, error: null }),
        update: (p: Record<string, unknown>) => ((op = "update"), (patch = p), q),
        delete: () => ((op = "delete"), q),
        insert: async (row: Record<string, unknown>) => {
          if (rows.some((r) => r.id === row.id)) return { error: { code: "23505", message: "dup" } };
          rows.push(row);
          log.push(`insert:${table}`);
          return { error: null };
        },
        then: (ok: (v: unknown) => unknown) => {
          if (op === "update") rows.filter(match).forEach((r) => Object.assign(r, patch));
          if (op === "delete") {
            for (let i = rows.length - 1; i >= 0; i--) if (match(rows[i])) rows.splice(i, 1);
          }
          log.push(`${op}:${table}`);
          return Promise.resolve(ok({ data: null, error: null }));
        },
      };
      return q;
    },
  };
  return { db, tables, log };
}

const fetcherFor = (p: Record<string, unknown>, seen: string[] = []) =>
  (async (_path: string, token: string) => {
    seen.push(token);
    return { ok: true, status: 200, data: p };
  }) as never;

test("1: valid payment marks paid using the booking partner's token", async () => {
  const { db, tables } = fakeDb({ bookings: [{ ...booking }], mp_partner_accounts: [{ ...account }] });
  const tokens: string[] = [];
  const r = await applyMpPaymentForBooking(db, booking.id, "187651313678", fetcherFor(payment(), tokens));
  assert.equal(r.status, "paid");
  assert.equal(tables.bookings[0].status, "paid");
  assert.equal(tables.bookings[0].mp_payment_id, "187651313678");
  assert.equal(tables.bookings[0].partner_net_clp, 8420);
  assert.deepEqual(tokens, ["tok-partner-1"]);
});

for (const [name, over] of [
  ["amount", { transaction_amount: 9999 }],
  ["currency", { currency_id: "USD" }],
  ["collector", { collector_id: 111 }],
  ["reference", { external_reference: "other" }],
  ["not_approved", { status: "pending" }],
] as const) {
  test(`1: ${name} mismatch does NOT mark paid`, async () => {
    const { db, tables } = fakeDb({ bookings: [{ ...booking }], mp_partner_accounts: [{ ...account }] });
    const r = await applyMpPaymentForBooking(db, booking.id, "187651313678", fetcherFor(payment(over)));
    assert.equal(r.status, "rejected");
    assert.equal((r as { reason: string }).reason, name);
    assert.equal(tables.bookings[0].status, "checkout");
  });
}

test("1: webhook ignores body.user_id as authority (partner mismatch rejected)", async () => {
  const { db, tables } = fakeDb({
    bookings: [{ ...booking }],
    mp_partner_accounts: [{ ...account }, { partner_id: "partner-2", mp_user_id: "999", ...enc("tok-2") }],
  });
  const r = await handleMpPaymentNotification(db, "187651313678", "999", fetcherFor(payment()));
  assert.equal(r.status, "rejected");
  assert.equal((r as { reason: string }).reason, "partner_mismatch");
  assert.equal(tables.bookings[0].status, "checkout");
});

test("2: application_fee different from booking fee is not paid and alerts", async () => {
  const { db, tables } = fakeDb({ bookings: [{ ...booking }], mp_partner_accounts: [{ ...account }] });
  const errors: unknown[][] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => void errors.push(a);
  try {
    const r = await applyMpPaymentForBooking(
      db, booking.id, "187651313678",
      fetcherFor(payment({ fee_details: [{ type: "application_fee", amount: 1000 }] })),
    );
    assert.equal((r as { reason: string }).reason, "fee_mismatch");
  } finally {
    console.error = orig;
  }
  assert.equal(tables.bookings[0].status, "checkout");
  assert.ok(errors.some((e) => e[0] === "mp_alert" && e[1] === "fee_mismatch"));
  assert.equal(checkMpPayment(payment({ fee_details: [] }), booking, account).ok, false);
});

test("3: event recorded only after success; failure is not recorded and returns 500", async () => {
  const { db, tables } = fakeDb({ mp_webhook_events: [] });
  const fail = await processMpEvent(db, "req-1", { topic: "payment", resourceId: "1" }, async () => ({ retry: true }));
  assert.equal(fail.status, 500);
  assert.equal(tables.mp_webhook_events.length, 0);
  const boom = await processMpEvent(db, "req-1", { topic: "payment", resourceId: "1" }, async () => {
    throw new Error("x");
  });
  assert.equal(boom.status, 500);
  assert.equal(tables.mp_webhook_events.length, 0);
  const ok = await processMpEvent(db, "req-1", { topic: "payment", resourceId: "1" }, async () => ({ retry: false }));
  assert.equal(ok.status, 200);
  assert.equal(tables.mp_webhook_events.length, 1);
  let ran = false;
  const again = await processMpEvent(db, "req-1", { topic: "payment", resourceId: "1" }, async () => {
    ran = true;
    return { retry: false };
  });
  assert.equal(again.idempotent, true);
  assert.equal(ran, false);
});

test("4: signature older than 300 s is rejected, fresh one passes", () => {
  const secret = "s";
  const now = 1_800_000_000_000;
  const tsOld = String(now / 1000 - 600);
  const tsNew = String(now / 1000 - 10);
  const sig = (ts: string) => createHmac("sha256", secret).update(mpManifest("1", "r", ts)).digest("hex");
  const base = { xRequestId: "r", dataId: "1", secret, toleranceSeconds: 300, nowMs: now };
  assert.equal(verifyMpSignature({ ...base, xSignature: `ts=${tsOld},v1=${sig(tsOld)}` }), false);
  assert.equal(verifyMpSignature({ ...base, xSignature: `ts=${tsNew},v1=${sig(tsNew)}` }), true);
});

test("P3: mpOrigin ignores request headers", () => {
  const req = new Request("https://x", { headers: { "x-forwarded-host": "evil.example" } });
  assert.equal(mpOrigin(req, { VERCEL_ENV: "production" }), "https://mapucoin.com");
  assert.equal(mpOrigin(req, { VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "b.vercel.app" }), "https://b.vercel.app");
  assert.equal(mpOrigin(req, { MP_PUBLIC_ORIGIN: "https://fixed.example/" }), "https://fixed.example");
});

test("P2: AES-256-GCM round trip, wrong key fails, key versions", () => {
  const e = encryptToken("APP_USR-secret");
  assert.ok(!e.enc.includes("APP_USR"));
  assert.equal(decryptToken(e.enc, e.version), "APP_USR-secret");
  assert.throws(() => decryptToken(e.enc, 1, { MP_TOKEN_KEY: randomBytes(32).toString("base64") }));
  const env = { MP_TOKEN_KEY: process.env.MP_TOKEN_KEY, MP_TOKEN_KEY_V2: randomBytes(32).toString("base64"), MP_TOKEN_KEY_VERSION: "2" };
  const e2 = encryptToken("x", env);
  assert.equal(e2.version, 2);
  assert.equal(decryptToken(e2.enc, 2, env), "x");
  assert.equal(decryptToken(e.enc, 1, env), "APP_USR-secret");
  assert.throws(() => encryptToken("x", {}));
});
