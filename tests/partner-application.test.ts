import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { POST as partnersPost } from "../app/api/partners/route.ts";
import { privacy } from "../lib/legal.ts";
import {
  PARTNER_PHOTO_MAX,
  PARTNER_PHOTO_SIGNED_SECONDS,
  partnerApplicationV2Enabled,
  validatePartnerChecklist,
} from "../lib/partner-application.ts";
import {
  partnerApplicationCopy,
  partnerPrivacyProposal,
} from "../lib/partner-application-copy.ts";
import { attachPartnerDossiers } from "../lib/partner-application-store.ts";
import {
  isInternalPartnerApplication,
  listPartners,
  mergePartnerQueues,
  resetPartnerBackendCache,
} from "../lib/partner-store.ts";
import { rutCheckDigit, validateChileanRut } from "../lib/rut.ts";
import {
  createSessionToken,
  setSessionVersionSource,
  SESSION_COOKIE,
  type SessionUser,
} from "../lib/session.ts";

const account: SessionUser = {
  id: "verified-user",
  email: "verified@mapucoin.test",
  name: "Vera",
  emailVerified: true,
  sessionVersion: 0,
};

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);

function checklist(overrides: Record<string, unknown> = {}) {
  return {
    full_name: "Ana Ruiz",
    email: account.email,
    account_email: account.email,
    role: "capsula",
    business: "Domos del Lago",
    legal_name: "Domos del Lago SpA",
    rut: "12.345.678-5",
    entity_type: "empresa",
    region: "Los Lagos",
    comuna: "Puerto Varas",
    presence_url: "https://instagram.com/domosdellago",
    description: "Cápsulas de vidrio frente al lago con desayuno local.",
    offers: [
      {
        name: "Noche en cápsula",
        price_clp: 180000,
        unit: "noche",
        min_stay_nights: 2,
        capacity: 2,
      },
    ],
    sernatur_registered: "no",
    sernatur_number: "",
    terms_accepted: "true",
    photos: [{ bytes: jpeg }, { bytes: jpeg }, { bytes: jpeg }],
    ...overrides,
  };
}

function builder(result: { data: unknown; error: unknown }) {
  const chain = {
    select() {
      return chain;
    },
    order() {
      return chain;
    },
    eq() {
      return chain;
    },
    limit() {
      return chain;
    },
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return chain;
}

function queueDb() {
  const partners = [
    {
      id: "partner-1",
      full_name: "Ana",
      email: "ana@mapucoin.test",
      business: "Domo Nuevo",
      status: "pending",
      created_at: "2026-02-01T00:00:00.000Z",
      is_test: false,
      phone: "911111111",
    },
    {
      id: "tours",
      full_name: "Ana Tours",
      email: "ana-tours@mapucoin.test",
      business: "Mapucoin Tours",
      status: "pending",
      created_at: "2026-01-15T00:00:00.000Z",
      is_test: false,
    },
  ];
  const applications = [
    {
      id: "app-1",
      full_name: "Luz",
      email: "luz@mapucoin.test",
      phone: "",
      role: "owner",
      yacht_name: "Ruka Sur",
      notes: "[mapucoin:gastronomia] Castro",
      status: "pending",
      created_at: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "kaenz-1",
      full_name: "Kai",
      email: "kai@kaenz.com",
      phone: "",
      role: "owner",
      yacht_name: "Kaenz Yacht",
      notes: "Looking for a slip in Algarrobo",
      status: "pending",
      created_at: "2026-04-01T00:00:00.000Z",
    },
    {
      id: "capsula-test",
      full_name: "Capsula Test",
      email: "test-mapucoin@salvazion.org",
      role: "owner",
      yacht_name: "Capsula Test",
      notes: "[mapucoin:capsula] Santiago",
      status: "pending",
      created_at: "2026-05-01T00:00:00.000Z",
    },
    {
      id: "fogon-test",
      full_name: "Fogón Test",
      email: "prod-mapucoin@salvazion.org",
      role: "owner",
      yacht_name: "Fogón Test",
      notes: "[mapucoin:gastronomia] Castro",
      status: "pending",
      created_at: "2026-05-02T00:00:00.000Z",
    },
    {
      id: "self",
      full_name: "Cristian",
      email: "cristian@salvazion.org",
      role: "owner",
      yacht_name: "Mapucoin",
      notes: "[mapucoin:capsula] Algarrobo",
      status: "pending",
      created_at: "2026-05-03T00:00:00.000Z",
    },
  ];
  return {
    from(name: string) {
      if (name === "partners") return builder({ data: partners, error: null });
      if (name === "applications") return builder({ data: applications, error: null });
      return builder({
        data: [],
        error: { code: "PGRST205", message: "does not exist" },
      });
    },
  } as unknown as SupabaseClient;
}

describe("Chilean RUT", () => {
  it("accepts a dotted RUT and the same digits without punctuation", () => {
    const dotted = validateChileanRut("12.345.678-5");
    const plain = validateChileanRut("123456785");
    assert.equal(dotted.ok, true);
    assert.equal(plain.ok, true);
    if (dotted.ok && plain.ok) {
      assert.equal(dotted.rut, "12.345.678-5");
      assert.equal(plain.rut, dotted.rut);
    }
  });

  it("rejects a wrong check digit and accepts K", () => {
    assert.equal(validateChileanRut("12.345.678-4").ok, false);
    assert.equal(validateChileanRut("12.345.678-K").ok, false);
    const body = "10000013";
    const dv = rutCheckDigit(body);
    assert.equal(dv, "K");
    const parsed = validateChileanRut(`10.000.013-${dv.toLowerCase()}`);
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.dv, "K");
  });
});

describe("partner checklist validation", () => {
  it("requires identity, offer, permits, and three real photos", () => {
    const base = checklist();
    assert.equal(validatePartnerChecklist(base).ok, true);
    const cases: Array<[string, Record<string, unknown>, string]> = [
      ["rut", { rut: "" }, "rut"],
      ["legal name", { legal_name: "" }, "incomplete"],
      ["region", { region: "" }, "region"],
      ["comuna", { comuna: "" }, "comuna"],
      ["website", { presence_url: "" }, "presence_url"],
      ["description", { description: "corta" }, "description"],
      ["price", { offers: [{ name: "Noche", price_clp: 0, unit: "noche" }] }, "offers"],
      ["stay", { offers: [{ name: "Noche", price_clp: 1000, unit: "noche" }] }, "stay"],
      ["terms", { terms_accepted: "false" }, "terms"],
      ["sernatur", { sernatur_registered: "si", sernatur_number: "" }, "sernatur"],
      ["photos", { photos: [] }, "photos"],
      [
        "too many photos",
        {
          photos: [
            { bytes: jpeg },
            { bytes: jpeg },
            { bytes: jpeg },
            { bytes: jpeg },
            { bytes: jpeg },
          ],
        },
        "photos",
      ],
      [
        "photo type",
        { photos: [{ bytes: new Uint8Array([1, 2, 3]) }, { bytes: jpeg }, { bytes: jpeg }] },
        "photos_type",
      ],
    ];
    for (const [, overrides, code] of cases) {
      const result = validatePartnerChecklist(checklist(overrides));
      assert.equal(result.ok, false, code);
      if (!result.ok) assert.equal(result.error, code);
    }
    const four = validatePartnerChecklist(
      checklist({
        photos: [
          { bytes: jpeg },
          { bytes: jpeg },
          { bytes: jpeg },
          { bytes: jpeg },
        ],
      }),
    );
    assert.equal(four.ok, true);
    assert.equal(PARTNER_PHOTO_MAX, 4);
    assert.equal(PARTNER_PHOTO_SIGNED_SECONDS, 10 * 60);
    const mismatch = validatePartnerChecklist(
      checklist({ email: "otra@mapucoin.test" }),
    );
    assert.equal(mismatch.ok, false);
    if (!mismatch.ok) assert.equal(mismatch.error, "email_mismatch");
  });

  it("keeps the flag off unless it is explicitly enabled", () => {
    const env = (values: Record<string, string>) => values as NodeJS.ProcessEnv;
    assert.equal(partnerApplicationV2Enabled(env({})), false);
    assert.equal(partnerApplicationV2Enabled(env({ VERCEL_ENV: "production" })), false);
    assert.equal(
      partnerApplicationV2Enabled(
        env({ VERCEL_ENV: "preview", MAPUCOIN_PARTNER_APPLICATION_V2: "0" }),
      ),
      false,
    );
    assert.equal(
      partnerApplicationV2Enabled(
        env({ VERCEL_ENV: "production", MAPUCOIN_PARTNER_APPLICATION_V2: "1" }),
      ),
      true,
    );
  });
});

describe("POST /api/partners checklist", () => {
  it("still swallows the website honeypot when the checklist is on", async () => {
    setSessionVersionSource(async () => 0);
    const previousFlag = process.env.MAPUCOIN_PARTNER_APPLICATION_V2;
    const previousEnv = process.env.VERCEL_ENV;
    process.env.MAPUCOIN_PARTNER_APPLICATION_V2 = "1";
    process.env.VERCEL_ENV = "preview";
    try {
      const res = await partnersPost(
        new Request("http://localhost/api/partners", {
          method: "POST",
          headers: {
            cookie: `${SESSION_COOKIE}=${await createSessionToken(account)}`,
            "content-type": "application/json",
            host: "localhost:3000",
            "x-forwarded-for": "203.0.113.10",
          },
          body: JSON.stringify({
            website: "https://spam.example",
            full_name: "Bot",
            email: account.email,
          }),
        }),
      );
      const body = (await res.json()) as { ok?: boolean; stored?: boolean; preview?: boolean };
      assert.equal(res.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.stored, true);
      assert.equal(body.preview, undefined);
    } finally {
      restore("MAPUCOIN_PARTNER_APPLICATION_V2", previousFlag);
      restore("VERCEL_ENV", previousEnv);
      setSessionVersionSource(null);
    }
  });

  it("rejects a checklist post that misses the RUT and accepts a complete preview", async () => {
    setSessionVersionSource(async () => 0);
    const previousFlag = process.env.MAPUCOIN_PARTNER_APPLICATION_V2;
    const previousEnv = process.env.VERCEL_ENV;
    process.env.MAPUCOIN_PARTNER_APPLICATION_V2 = "1";
    process.env.VERCEL_ENV = "preview";
    try {
      const cookie = `${SESSION_COOKIE}=${await createSessionToken(account)}`;
      const missing = await partnersPost(
        new Request("http://localhost/api/partners", {
          method: "POST",
          headers: {
            cookie,
            "content-type": "application/json",
            host: "localhost:3000",
            "x-forwarded-for": "203.0.113.11",
          },
          body: JSON.stringify({ ...checklist(), photos: undefined, rut: "" }),
        }),
      );
      assert.equal(missing.status, 400);
      assert.equal(((await missing.json()) as { error?: string }).error, "rut");

      const fd = new FormData();
      const value = checklist();
      for (const [key, field] of Object.entries(value)) {
        if (key === "photos" || key === "account_email" || key === "offers") continue;
        fd.set(key, String(field ?? ""));
      }
      fd.set("offers_json", JSON.stringify(value.offers));
      for (let i = 0; i < 3; i += 1) {
        fd.append("photos", new File([jpeg], `foto-${i}.jpg`, { type: "image/jpeg" }));
      }
      const ok = await partnersPost(
        new Request("http://localhost/api/partners", {
          method: "POST",
          headers: {
            cookie,
            host: "localhost:3000",
            "x-forwarded-for": "203.0.113.12",
          },
          body: fd,
        }),
      );
      const body = (await ok.json()) as { preview?: boolean; stored?: boolean; notified?: boolean };
      assert.equal(ok.status, 200);
      assert.equal(body.preview, true);
      assert.equal(body.stored, false);
      assert.equal(body.notified, false);
    } finally {
      restore("MAPUCOIN_PARTNER_APPLICATION_V2", previousFlag);
      restore("VERCEL_ENV", previousEnv);
      setSessionVersionSource(null);
    }
  });

  it("keeps the legacy form when the flag is off", async () => {
    setSessionVersionSource(async () => 0);
    const previousFlag = process.env.MAPUCOIN_PARTNER_APPLICATION_V2;
    const previousEnv = process.env.VERCEL_ENV;
    process.env.MAPUCOIN_PARTNER_APPLICATION_V2 = "0";
    process.env.VERCEL_ENV = "preview";
    try {
      const res = await partnersPost(
        new Request("http://localhost/api/partners", {
          method: "POST",
          headers: {
            cookie: `${SESSION_COOKIE}=${await createSessionToken(account)}`,
            "content-type": "application/json",
            host: "localhost:3000",
            "x-forwarded-for": "203.0.113.13",
          },
          body: JSON.stringify({
            full_name: "Ana Ruiz",
            email: "ana@mapucoin.test",
            role: "capsula",
            business: "Domo Sur",
            city: "Pucón",
            rut: "no-es-un-rut",
          }),
        }),
      );
      const body = (await res.json()) as { preview?: boolean; stored?: boolean };
      assert.equal(res.status, 200);
      assert.equal(body.preview, true);
      assert.equal(body.stored, false);
    } finally {
      restore("MAPUCOIN_PARTNER_APPLICATION_V2", previousFlag);
      restore("VERCEL_ENV", previousEnv);
      setSessionVersionSource(null);
    }
  });
});

describe("admin partner listing", () => {
  it("shows Mapucoin rows from applications without listing Kaenz rows", async () => {
    resetPartnerBackendCache();
    const db = queueDb();
    const pub = await listPartners(db, "pending");
    assert.deepEqual(
      pub.partners.map((row) => row.id),
      ["partner-1", "tours"],
    );
    resetPartnerBackendCache();
    const admin = await listPartners(db, "pending", { scope: "admin" });
    assert.deepEqual(
      admin.partners.map((row) => row.id),
      ["app-1", "partner-1", "tours"],
    );
    assert.equal(isInternalPartnerApplication({
      email: "test-mapucoin@salvazion.org",
      business: "Capsula Test",
    }), true);
    assert.equal(isInternalPartnerApplication({
      email: "prod-mapucoin@salvazion.org",
      business: "Fogón Test",
    }), true);
    assert.equal(isInternalPartnerApplication({ business: "Mapucoin" }), true);
    assert.equal(isInternalPartnerApplication({ business: "Mapucoin Tours" }), false);
    assert.equal(
      admin.partners.some((row) => row.id === "kaenz-1"),
      false,
    );
    assert.deepEqual(
      mergePartnerQueues(
        [{ id: "a", created_at: "2026-01-01" }],
        [{ id: "a", created_at: "2026-01-02" }, { id: "b", created_at: "2026-02-01" }],
      ).map((row) => row.id),
      ["b", "a"],
    );
  });

  it("attaches the dossier and signed photo URLs for the reviewer", async () => {
    const db = {
      from(table: string) {
        const data =
          table === "partner_application_details"
            ? [
                {
                  application_id: "partner-1",
                  legal_name: "Domos del Lago SpA",
                  rut: "12.345.678-5",
                  entity_type: "empresa",
                  category: "capsula",
                  region: "Los Lagos",
                  comuna: "Puerto Varas",
                  presence_url: "https://instagram.com/domosdellago",
                  description: "Cápsulas de vidrio frente al lago con desayuno local.",
                  offers: [
                    {
                      name: "Noche en cápsula",
                      price_clp: 180000,
                      unit: "noche",
                      min_stay_nights: 2,
                      capacity: 2,
                    },
                  ],
                  sernatur_registered: true,
                  sernatur_number: "SN-123",
                  terms_accepted_at: "2026-11-11T12:00:00.000Z",
                  photo_paths: ["acct/1.jpg", "acct/2.jpg", "acct/3.jpg"],
                },
              ]
            : [];
        const chain = {
          select() {
            return chain;
          },
          in() {
            return Promise.resolve({ data, error: null });
          },
        };
        return chain;
      },
      storage: {
        from() {
          return {
            createSignedUrls(paths: string[]) {
              return Promise.resolve({
                data: paths.map((path) => ({
                  path,
                  signedUrl: `https://signed.test/${path}`,
                  signedURL: `https://signed.test/${path}`,
                  error: null,
                })),
                error: null,
              });
            },
          };
        },
      },
    } as unknown as SupabaseClient;
    const [row] = await attachPartnerDossiers(db, [{ id: "partner-1" }]);
    assert.equal(row.dossier?.rut, "12.345.678-5");
    assert.equal(row.dossier?.sernatur_number, "SN-123");
    assert.equal(row.dossier?.photos.length, 3);
    assert.equal(row.dossier?.photos[0]?.url, "https://signed.test/acct/1.jpg");
    const admin = readFileSync("app/admin/partners/page.tsx", "utf8");
    assert.match(admin, /PartnerDossierView/);
    assert.match(admin, /adminPhotos/);
    assert.match(admin, /adminSernatur/);
  });
});

describe("checklist copy and migration safety", () => {
  it("keeps new public strings in one module, capitalized after colons, without Stripe", () => {
    const locales = Object.values(partnerApplicationCopy);
    assert.equal(locales.length, 6);
    const keys = Object.keys(partnerApplicationCopy.es).sort();
    for (const copy of locales) {
      assert.deepEqual(Object.keys(copy).sort(), keys);
      for (const value of Object.values(copy)) {
        assert.equal(/:\s*\p{Ll}/u.test(value), false, value);
        assert.equal(/stripe/i.test(value), false, value);
      }
    }
    assert.equal(/:\s*\p{Ll}/u.test(partnerPrivacyProposal), false);
    assert.equal(/stripe/i.test(partnerPrivacyProposal), false);
    const published = [privacy.intro, ...privacy.sections.map((section) => section.body)].join(
      "\n",
    );
    assert.equal(published.includes("fotografías quedan en un almacenamiento privado"), false);
    const page = readFileSync("app/privacidad/page.tsx", "utf8");
    assert.equal(page.includes("partnerPrivacyProposal"), false);
  });

  it("adds the dossier with RLS and a rollback that does not drop Kaenz tables", () => {
    const sql = readFileSync("supabase/partner-application-v2.sql", "utf8");
    const rollback = readFileSync("supabase/rollback/partner-application-v2.sql", "utf8");
    assert.match(sql, /enable row level security/i);
    assert.match(
      sql,
      /revoke all on table public\.partner_application_details from public, anon, authenticated/i,
    );
    assert.match(sql, /partner-application-photos/);
    assert.match(sql, /public = false/);
    assert.doesNotMatch(sql, /^\s*grant\b[^;]*\bto\s+anon\b/im);
    assert.doesNotMatch(sql, /^\s*grant\b[^;]*\bto\s+authenticated\b/im);
    assert.doesNotMatch(sql, /alter table public\.applications/i);
    assert.doesNotMatch(sql, /alter table public\.profiles/i);
    assert.match(rollback, /drop table if exists public\.partner_application_details/i);
    assert.match(rollback, /begin;/i);
    assert.match(rollback, /commit;/i);
    assert.match(rollback, /partner-application-photos/);
    assert.doesNotMatch(rollback, /delete\s+from\s+storage/i);
    const photoRollback = readFileSync("scripts/rollback-partner-photos.ts", "utf8");
    assert.match(photoRollback, /emptyBucket/);
    assert.match(photoRollback, /deleteBucket/);
    assert.doesNotMatch(photoRollback, /delete\s+from\s+storage/i);
    const route = readFileSync("app/api/partners/route.ts", "utf8");
    assert.match(route, /checklist \? \{ scope: "admin" \} : \{\}/);
    assert.match(route, /omitPartnerPhone/);
    assert.match(route, /terms_version: TERMS_IN_FORCE/);
    assert.match(route, /privacy_version: PRIVACY_VERSION/);
    assert.equal(PARTNER_PHOTO_SIGNED_SECONDS <= 10 * 60, true);
    assert.equal(PARTNER_PHOTO_SIGNED_SECONDS >= 5 * 60, true);
    assert.doesNotMatch(rollback, /drop table[^;]*\bapplications\b/i);
    assert.doesNotMatch(rollback, /drop table[^;]*\bprofiles\b/i);
    assert.doesNotMatch(rollback, /drop table[^;]*\bbookings\b/i);
    const approve = readFileSync("app/api/partners/approve/route.ts", "utf8");
    const post = readFileSync("app/api/partners/route.ts", "utf8");
    assert.equal(/resend|sendMail|nodemailer|webhook/i.test(approve), false);
    assert.equal(/resend|sendMail|nodemailer|webhook/i.test(post), false);
  });
});

function restore(name: "MAPUCOIN_PARTNER_APPLICATION_V2" | "VERCEL_ENV", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
