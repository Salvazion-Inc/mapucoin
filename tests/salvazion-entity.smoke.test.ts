import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { privacy, terms } from "../lib/legal.ts";

const INC = /Salvazion,?\s+Inc\.?/;

function read(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

function section(sections: { heading: string; body: string }[], heading: string) {
  const found = sections.find((item) => item.heading.startsWith(heading));
  assert.ok(found, heading);
  return found.body;
}

describe("site owner shown as Salvazion SpA", () => {
  it("uses one shared footer rights line", () => {
    const footer = read("../components/Footer.tsx");
    assert.match(
      footer,
      /All Rights Reserved for Salvazion SpA \{new Date\(\)\.getFullYear\(\)\}\./,
    );
    assert.doesNotMatch(footer, INC);
  });

  it("names Salvazion SpA as operator and rights holder in the terms", () => {
    const definitions = section(terms.sections, "1.");
    const liability = section(terms.sections, "7.");
    assert.match(definitions, /operada por Salvazion SpA\./);
    assert.match(liability, /Salvazion SpA no responde/);
    assert.doesNotMatch(definitions, INC);
    assert.doesNotMatch(liability, INC);
    assert.doesNotMatch(terms.intro, INC);
  });

  it("names Salvazion SpA as operator and controller in the privacy policy", () => {
    const controller = section(privacy.sections, "1.");
    const transfers = section(privacy.sections, "6.");
    assert.match(privacy.intro, /operada por Salvazion SpA\./);
    assert.match(controller, /Responsable: Salvazion SpA, sociedad de Delaware\./);
    assert.match(transfers, /Salvazion SpA está en Estados Unidos\./);
    assert.doesNotMatch(privacy.intro, INC);
    assert.doesNotMatch(controller, INC);
    assert.doesNotMatch(transfers, INC);
  });
});

describe("payment platform stays Salvazion, Inc.", () => {
  it("keeps the Stripe platform account name", () => {
    const stripe = read("../docs/stripe-connect.md");
    assert.match(
      stripe,
      /cuenta de plataforma \(Salvazion Inc\., US\)/,
    );
    assert.doesNotMatch(stripe, /Salvazion SpA/);
  });

  it("keeps Stripe as the processor in the terms and privacy copy", () => {
    const payments = section(terms.sections, "4.");
    const data = section(privacy.sections, "2.");
    const processors = section(privacy.sections, "4.");
    assert.match(payments, /El pago se procesa con Stripe/);
    assert.match(data, /Stripe procesa el pago/);
    assert.match(processors, /Stripe \(pagos\)/);
    assert.doesNotMatch(payments, /Salvazion SpA|Salvazion, Inc/);
    assert.doesNotMatch(data, INC);
    assert.doesNotMatch(processors, INC);
  });

  it("keeps the US legal entity in llms.txt and metadata", () => {
    const llms = read("../public/llms.txt");
    const seo = read("../lib/seo.ts");
    assert.match(llms, /operated by Salvazion, Inc\. \(a Delaware corporation\)/);
    assert.match(
      llms,
      /Legal name: Salvazion, Inc\. · 131 Continental Dr, Suite 305, Newark, DE 19713, USA/,
    );
    assert.match(seo, /legalName: "Salvazion, Inc\."/);
    assert.match(seo, /Operado por Salvazion, Inc\./);
    assert.doesNotMatch(llms, /Salvazion SpA/);
    assert.doesNotMatch(seo, /Salvazion SpA/);
  });

  it("does not rotate the fallback session secret", () => {
    const session = read("../lib/session.ts");
    assert.match(session, /mapucoin-by-salvazion-inc-session-key/);
  });
});
