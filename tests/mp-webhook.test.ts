import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mpManifest } from "@/lib/mp";

process.env.PAYMENTS_PROVIDER = "mp";
process.env.MP_ACCESS_TOKEN = "x";
process.env.MP_CLIENT_ID = "1";
process.env.MP_CLIENT_SECRET = "s";
process.env.MP_WEBHOOK_SECRET = "whsec";
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

const { POST } = await import("@/app/api/mp/webhook/route");
const quiet = async <T>(fn: () => Promise<T>) => {
  const o = console.log;
  console.log = () => {};
  try { return await fn(); } finally { console.log = o; }
};

test("legacy 'Pagos (legacy)' IPN (?topic=payment&id=…, unsigned) → 200 ignored", async () => {
  const r = await quiet(() => POST(new Request("https://mapucoin.com/api/mp/webhook?topic=payment&id=187654545914", { method: "POST", body: "" })));
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, ignored: "unsigned" });
});

test("legacy merchant_order (unsigned) → 200 ignored", async () => {
  const r = await quiet(() => POST(new Request("https://mapucoin.com/api/mp/webhook?topic=merchant_order&id=45831994710", { method: "POST" })));
  assert.equal(r.status, 200);
});

test("signed Webhooks merchant_order with bad signature → 401; valid signature reaches processing", async () => {
  const bad = await POST(new Request("https://mapucoin.com/api/mp/webhook?type=merchant_order&data.id=45831994710", {
    method: "POST", headers: { "x-signature": "ts=1,v1=00", "x-request-id": "r1" }, body: JSON.stringify({ type: "merchant_order", data: { id: "45831994710" } }),
  }));
  assert.equal(bad.status, 401);
  const ts = String(Math.floor(Date.now() / 1000));
  const v1 = createHmac("sha256", "whsec").update(mpManifest("45831994710", "r2", ts)).digest("hex");
  const ok = await POST(new Request("https://mapucoin.com/api/mp/webhook?type=merchant_order&data.id=45831994710", {
    method: "POST", headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": "r2" }, body: JSON.stringify({ type: "merchant_order", data: { id: "45831994710" } }),
  }));
  // Signature accepted; without a DB in tests the route answers 500 (MP retries), never 401.
  assert.equal(ok.status, 500);
});
