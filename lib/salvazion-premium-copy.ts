/**
 * Spanish UI for the access key. Promotional lines must not promise
 * investment, returns, or a token price. The disclaimer is the C7 sentence.
 */

export const PREMIUM_COPY_ES = {
  title: "Mapucoin Premium",
  lead: "Comprueba la clave $SALVAZION para abrir Mapucoin Premium.",
  disclaimer:
    "La clave $SALVAZION es solo una llave de acceso. No es una inversión, no genera retornos y Mapucoin no promete un precio.",
  benefit: "Beneficio de holder: acceso Premium en esta cuenta.",
  note: "Nota Premium: al planificar, pide menos traslados y más tiempo en el territorio. El itinerario sigue tu presupuesto de viaje.",
  active: "Premium activo",
  walletLabel: "Dirección pública",
  walletHint: "Se consulta en la red y no se guarda.",
  submit: "Comprobar acceso",
  checking: "Comprobando…",
  invalid: "Esa dirección no es válida.",
  notHolder: "Esa dirección no abre Premium.",
  unconfigured: "La comprobación de holders no está configurada.",
  rpcError: "No se pudo comprobar la clave. Inténtalo más tarde.",
  rate: "Demasiados intentos. Espera un momento.",
} as const;

export const C7_BANNED_PROMISE = [
  "inversión",
  "inversion",
  "retorno",
  "rentabilidad",
  "dividendo",
  "especul",
  "apreciacion",
  "apreciación",
  "yield",
  "plusvalía",
  "plusvalia",
  "criptomoneda",
  "ganar dinero",
] as const;

export function financialPromiseHits(text: string): string[] {
  const hay = text.toLowerCase();
  return C7_BANNED_PROMISE.filter((word) => hay.includes(word));
}
