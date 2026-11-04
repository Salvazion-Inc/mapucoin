import { test } from "node:test";
import assert from "node:assert/strict";
import { approvedPartnersResponse } from "@/lib/partners-approved";

const db = {} as never;
const quiet = async <T>(fn: () => Promise<T>) => {
  const orig = console.error;
  const logs: unknown[][] = [];
  console.error = (...a: unknown[]) => void logs.push(a);
  try {
    return { r: await fn(), logs };
  } finally {
    console.error = orig;
  }
};

test("DB error → 500 with log, not an empty list", async () => {
  const { r, logs } = await quiet(() =>
    approvedPartnersResponse(db, async () => {
      throw new Error("permission denied for table partners");
    }),
  );
  assert.equal(r.status, 500);
  assert.deepEqual(await r.json(), { error: "partners_unavailable" });
  assert.ok(logs.some((l) => l[0] === "partners_approved_error"));
});

test("no DB client configured → 200 [] (static catalog), unchanged", async () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    const r = await approvedPartnersResponse(null);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { partners: [] });
  } finally {
    console.warn = orig;
  }
});

test("success → 200 with public fields only", async () => {
  const r = await approvedPartnersResponse(db, async () => [
    { id: "1", slug: "s", business: "B", city: "C", role: "capsule", lat: -39, lng: -72, price_from_clp: 1, offer_summary: "o", landscape: "bosque", email: "x@y.z" } as never,
  ]);
  assert.equal(r.status, 200);
  const body = (await r.json()) as { partners: Record<string, unknown>[] };
  assert.ok(Array.isArray(body.partners));
  for (const p of body.partners) assert.equal("email" in p, false);
});

test("success with no partners → 200 []", async () => {
  const r = await approvedPartnersResponse(db, async () => []);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { partners: [] });
});
