import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { terms } from "../lib/legal.ts";
import {
  PREMIUM_COPY_ES,
  financialPromiseHits,
} from "../lib/salvazion-premium-copy.ts";
import {
  decodeBalance,
  encodeBalanceOf,
  gatePremiumAccess,
  isAllowedRpcUrl,
  isSalvazionPremiumKeyEnabled,
  parseMinRaw,
  premiumKeySettings,
  premiumOriginAllowed,
} from "../lib/salvazion-premium.ts";
import {
  readPremiumCookie,
  signPremiumCookie,
  verifyHolder,
} from "../lib/salvazion-premium-server.ts";

const HOLDER = "0x0000000000000000000000000000000000000001";
const TOKEN = "0x1111111111111111111111111111111111111111";
const RPC = "https://rpc.example.com/salvazion";

describe("SALVAZION premium key flag", () => {
  it("stays off unless the env is an explicit on value", () => {
    for (const raw of [undefined, null, "", "false", "0", "no", "off", " FALSE ", "nope"]) {
      assert.equal(isSalvazionPremiumKeyEnabled(raw), false, String(raw));
    }
    for (const raw of ["true", "TRUE", " 1 ", "yes", "on"]) {
      assert.equal(isSalvazionPremiumKeyEnabled(raw), true, raw);
    }
  });

  it("denies premium when the flag is off, even with a leftover grant", () => {
    assert.deepEqual(gatePremiumAccess(false, true), {
      enabled: false,
      premium: false,
    });
    assert.deepEqual(gatePremiumAccess(false, false), {
      enabled: false,
      premium: false,
    });
  });

  it("honors a grant only when the flag is on", () => {
    assert.deepEqual(gatePremiumAccess(true, false), {
      enabled: true,
      premium: false,
    });
    assert.deepEqual(gatePremiumAccess(true, true), {
      enabled: true,
      premium: true,
    });
  });
});

describe("holder verification", () => {
  it("does not call the network when the flag is off", async () => {
    let called = false;
    const result = await verifyHolder({
      enabled: false,
      wallet: HOLDER,
      settings: {
        tokenAddress: TOKEN,
        rpcUrl: RPC,
        minRaw: BigInt(1),
        configured: true,
      },
      fetchImpl: async () => {
        called = true;
        throw new Error("rpc should not run");
      },
    });
    assert.equal(called, false);
    assert.deepEqual(result, {
      enabled: false,
      premium: false,
      reason: "flag_off",
    });
  });

  it("unlocks premium for a holder when the flag is on", async () => {
    const result = await verifyHolder({
      enabled: true,
      wallet: ` ${HOLDER} `,
      settings: {
        tokenAddress: TOKEN,
        rpcUrl: RPC,
        minRaw: BigInt(1),
        configured: true,
      },
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        assert.equal(body.method, "eth_call");
        assert.equal(body.params[0].to, TOKEN);
        assert.equal(body.params[0].data, encodeBalanceOf(HOLDER));
        return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "0x1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    });
    assert.deepEqual(result, { enabled: true, premium: true, reason: "holder" });
  });

  it("keeps premium closed for a zero balance when the flag is on", async () => {
    const result = await verifyHolder({
      enabled: true,
      wallet: HOLDER,
      settings: {
        tokenAddress: TOKEN,
        rpcUrl: RPC,
        minRaw: BigInt(1),
        configured: true,
      },
      fetchImpl: async () =>
        new Response(JSON.stringify({ result: "0x0" }), { status: 200 }),
    });
    assert.deepEqual(result, {
      enabled: true,
      premium: false,
      reason: "not_holder",
    });
  });

  it("rejects a bad address and an unconfigured reader without a call", async () => {
    const fetchImpl = async () => {
      throw new Error("rpc should not run");
    };
    const invalid = await verifyHolder({
      enabled: true,
      wallet: "not-a-wallet",
      settings: {
        tokenAddress: TOKEN,
        rpcUrl: RPC,
        minRaw: BigInt(1),
        configured: true,
      },
      fetchImpl,
    });
    assert.equal(invalid.reason, "invalid_wallet");
    assert.equal(invalid.premium, false);

    const missing = await verifyHolder({
      enabled: true,
      wallet: HOLDER,
      settings: {
        tokenAddress: "",
        rpcUrl: "",
        minRaw: BigInt(1),
        configured: false,
      },
      fetchImpl,
    });
    assert.equal(missing.reason, "unconfigured");
    assert.equal(missing.premium, false);
  });

  it("encodes balanceOf and decodes a hex word", () => {
    const data = encodeBalanceOf(HOLDER);
    assert.equal(data?.startsWith("0x70a08231"), true);
    assert.equal(data?.endsWith(HOLDER.slice(2)), true);
    assert.equal(decodeBalance("0x0a"), BigInt(10));
    assert.equal(decodeBalance("nope"), null);
    assert.equal(parseMinRaw(undefined), BigInt(1));
    assert.equal(parseMinRaw("0"), BigInt(1));
    assert.equal(parseMinRaw("5"), BigInt(5));
  });

  it("refuses private and non-https RPC urls", () => {
    assert.equal(isAllowedRpcUrl(RPC), true);
    assert.equal(isAllowedRpcUrl("http://rpc.example.com"), false);
    assert.equal(isAllowedRpcUrl("https://127.0.0.1/rpc"), false);
    assert.equal(isAllowedRpcUrl("https://169.254.169.254/"), false);
    assert.equal(isAllowedRpcUrl("https://user:pass@rpc.example.com"), false);
  });

  it("signs a grant that the flag gate can still ignore", () => {
    const now = 1_700_000_000_000;
    const token = signPremiumCookie("test-secret", now);
    assert.equal(readPremiumCookie(token, "test-secret", now + 1000), true);
    assert.equal(readPremiumCookie(token, "other-secret", now + 1000), false);
    assert.equal(token && token.includes("0x"), false);
    const open = gatePremiumAccess(true, readPremiumCookie(token, "test-secret", now));
    const shut = gatePremiumAccess(false, readPremiumCookie(token, "test-secret", now));
    assert.equal(open.premium, true);
    assert.equal(shut.premium, false);
  });

  it("keeps default settings disabled", () => {
    const settings = premiumKeySettings({});
    assert.equal(settings.enabled, false);
    assert.equal(settings.configured, false);
    assert.equal(settings.minRaw, BigInt(1));
  });

  it("accepts the site origin and rejects a foreign one", () => {
    assert.equal(premiumOriginAllowed(null), true);
    assert.equal(premiumOriginAllowed("https://mapucoin.com"), true);
    assert.equal(premiumOriginAllowed("https://evil.example"), false);
  });
});

describe("Constraint 7 copy", () => {
  it("keeps promotional Spanish strings free of financial promises", () => {
    const { disclaimer, ...promo } = PREMIUM_COPY_ES;
    for (const [key, text] of Object.entries(promo)) {
      assert.deepEqual(financialPromiseHits(text), [], key);
    }
    assert.match(disclaimer, /llave de acceso/);
    assert.match(disclaimer, /no es una inversión/i);
    assert.match(disclaimer, /no genera retornos/i);
    assert.match(disclaimer, /no promete un precio/i);
  });

  it("states the access-key limit in the terms", () => {
    const section = terms.sections.find((s) => s.heading.startsWith("9."));
    assert.ok(section);
    assert.match(section.body, /llave de acceso/);
    assert.match(section.body, /No es una inversión/);
    assert.match(section.body, /no genera retornos/);
    assert.match(section.body, /acceso Premium/);
  });

  it("finds no investment promise in the existing Spanish UI", () => {
    const files = ["lib/copy.ts", "lib/app-copy.ts", "lib/seo.ts"];
    for (const file of files) {
      const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
      assert.deepEqual(financialPromiseHits(text), [], file);
    }
  });

  it("leaves payments, stripe, auth providers, and migrations untouched", () => {
    const files = [
      "app/api/premium/route.ts",
      "lib/salvazion-premium.ts",
      "lib/salvazion-premium-server.ts",
      "lib/salvazion-premium-copy.ts",
      "components/app/PremiumKeyPanel.tsx",
      "app/app/cuenta/page.tsx",
    ];
    for (const file of files) {
      const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
      assert.doesNotMatch(
        text,
        /stripe|supabase|google-oauth|\/api\/checkout|schema\.sql|apply_migration/i,
        file,
      );
    }
  });

  it("tells the concierge and llms.txt that the key is access only", () => {
    const chat = readFileSync(new URL("../app/api/chat/route.ts", import.meta.url), "utf8");
    const plan = readFileSync(new URL("../app/api/plan/route.ts", import.meta.url), "utf8");
    const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
    for (const src of [chat, plan, llms]) {
      assert.match(src, /llave de acceso/);
    }
  });
});
