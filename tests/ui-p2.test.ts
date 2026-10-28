import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { showSignupVerifiedBadge } from "../lib/app-copy.ts";
import { t } from "../lib/copy.ts";
import { localeMeta, LOCALES } from "../lib/locale.ts";
import { composeDocumentTitle, pageTitle } from "../lib/seo.ts";

describe("GOVERN P2 UI", () => {
  it("shows Cuenta verificada only for a verified email", () => {
    assert.equal(showSignupVerifiedBadge(false), false);
    assert.equal(showSignupVerifiedBadge(undefined), false);
    assert.equal(showSignupVerifiedBadge(null), false);
    assert.equal(showSignupVerifiedBadge(true), true);
  });

  it("translates the Spanish footer through i18n and leaves English in English", () => {
    const es = t("es");
    assert.equal(es.footer.rights, "Todos los derechos reservados para");
    assert.equal(es.footer.terms, "Términos");
    assert.equal(es.footer.privacy, "Privacidad");
    assert.equal(
      `${es.footer.rights} Salvazion SpA 2026.`,
      "Todos los derechos reservados para Salvazion SpA 2026.",
    );

    const en = t("en");
    assert.equal(en.footer.rights, "All Rights Reserved for");
    assert.equal(en.footer.terms, "Terms");
    assert.equal(en.footer.privacy, "Privacy");
    assert.equal(t("pt").footer.terms, "Termos");
    assert.equal(t("pt").footer.privacy, "Privacidade");
    assert.equal(t("fr").footer.terms, "Conditions");
    assert.equal(t("fr").footer.privacy, "Confidentialité");
    assert.equal(t("it").footer.terms, "Termini");
    assert.equal(t("de").footer.terms, "AGB");
    assert.equal(t("de").footer.privacy, "Datenschutz");
  });

  it("labels the partners website field in Spanish", () => {
    assert.equal(t("es").partners.website, "Sitio web");
    assert.equal(t("en").partners.website, "Website");
    assert.equal(t("pt").partners.website, "Site");
    assert.equal(t("fr").partners.website, "Site web");
    assert.equal(t("it").partners.website, "Sito web");
    assert.equal(t("de").partners.website, "Website");
  });

  it("applies the title template once", () => {
    assert.equal(pageTitle("Entrar | Mapucoin"), "Entrar");
    assert.equal(pageTitle("Crear cuenta | Mapucoin"), "Crear cuenta");
    assert.equal(pageTitle("Verifica tu correo | Mapucoin"), "Verifica tu correo");
    assert.equal(pageTitle("Entrar | Mapucoin | Mapucoin"), "Entrar");
    assert.equal(pageTitle("Reservar cápsula"), "Reservar cápsula");
    assert.equal(pageTitle("Reserva confirmada"), "Reserva confirmada");
    assert.equal(pageTitle("Admin partners"), "Admin partners");
    assert.equal(pageTitle("Mapucoin App"), "Mapucoin App");
    assert.equal(composeDocumentTitle("Entrar | Mapucoin"), "Entrar | Mapucoin");
    assert.equal(composeDocumentTitle("Crear cuenta | Mapucoin"), "Crear cuenta | Mapucoin");
    assert.equal(
      composeDocumentTitle("Verifica tu correo | Mapucoin"),
      "Verifica tu correo | Mapucoin",
    );
    assert.equal(composeDocumentTitle("Reservar cápsula"), "Reservar cápsula | Mapucoin");
    assert.equal(composeDocumentTitle("Mapucoin App"), "Mapucoin App | Mapucoin");
    assert.equal(composeDocumentTitle("Partner"), "Partner | Mapucoin");
    assert.equal(composeDocumentTitle("Cápsula"), "Cápsula | Mapucoin");
    assert.equal(composeDocumentTitle("Destino"), "Destino | Mapucoin");
  });

  it("exposes a short accessible name for every language flag", () => {
    const names = LOCALES.map((code) => localeMeta[code].name);
    assert.deepEqual(names, [
      "Español",
      "English",
      "Português",
      "Français",
      "Italiano",
      "Deutsch",
    ]);
  });
});
