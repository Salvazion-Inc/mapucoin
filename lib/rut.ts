/** Chilean RUT: 7 or 8 body digits plus the modulo-11 check digit. */

const RUT_BODY = /^(\d{7,8})([0-9K])$/;

export function rutCheckDigit(body: string) {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return "0";
  if (rest === 10) return "K";
  return String(rest);
}

export function formatRut(body: string, dv: string) {
  const digits = body.replace(/^0+/, "") || "0";
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return `${groups.join(".")}-${dv}`;
}

export type RutResult =
  | { ok: true; rut: string; body: string; dv: string }
  | { ok: false };

/** Accepts 12.345.678-5, 12345678-5, and 123456785. Stores dotted form. */
export function validateChileanRut(value: string): RutResult {
  const compact = value
    .trim()
    .toUpperCase()
    .replace(/[^0-9K]/g, "");
  const match = compact.match(RUT_BODY);
  if (!match) return { ok: false };
  const body = match[1];
  const dv = match[2];
  if (rutCheckDigit(body) !== dv) return { ok: false };
  return { ok: true, rut: formatRut(body, dv), body, dv };
}
