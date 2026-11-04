import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * App-side encryption for Mercado Pago OAuth tokens (AES-256-GCM).
 * Keys: MP_TOKEN_KEY (base64, 32 bytes) is version 1; MP_TOKEN_KEY_V<n> for later versions.
 * MP_TOKEN_KEY_VERSION selects the version used for new writes (default 1).
 * Stored format: base64(iv[12] | tag[16] | ciphertext). The database never sees the token.
 */
type Env = Record<string, string | undefined>;

function keyFor(version: number, env: Env): Buffer {
  const raw = version === 1 ? env.MP_TOKEN_KEY || env.MP_TOKEN_KEY_V1 : env[`MP_TOKEN_KEY_V${version}`];
  const key = raw ? Buffer.from(raw, "base64") : Buffer.alloc(0);
  if (key.length !== 32) throw new Error("mp_token_key_missing");
  return key;
}

export function currentKeyVersion(env: Env = process.env) {
  const v = Number(env.MP_TOKEN_KEY_VERSION || 1);
  return Number.isInteger(v) && v > 0 ? v : 1;
}

export function encryptToken(plain: string, env: Env = process.env, version = currentKeyVersion(env)) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", keyFor(version, env), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return { enc: Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64"), version };
}

export function decryptToken(enc: string, version: number, env: Env = process.env) {
  const buf = Buffer.from(enc, "base64");
  const d = createDecipheriv("aes-256-gcm", keyFor(version, env), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

export const MP_ACCOUNT_COLUMNS = "partner_id, mp_user_id, access_token_enc, key_version, live_mode";

/** Access token of a stored mp_partner_accounts row, or null if absent/undecryptable. */
export function accountAccessToken(row: { access_token_enc?: string | null; key_version?: number | null } | null) {
  if (!row?.access_token_enc) return null;
  try {
    return decryptToken(row.access_token_enc, Number(row.key_version) || 1);
  } catch {
    console.error("mp_token_decrypt_failed");
    return null;
  }
}
