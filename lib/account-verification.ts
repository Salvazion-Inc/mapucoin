/**
 * Email verification lives on the account, not in a cookie logout can drop.
 * Supabase Auth `user_metadata.mapucoin_email_verified` is the server record
 * (no table change). The password vault cookie is only a same-browser cache.
 *
 * Accounts created before VERIFICATION_GATE_AT with no flag are not bulk-updated.
 * They verify once and see a legacy message. A missing flag is not stored as false.
 */
export const VERIFICATION_META = "mapucoin_email_verified";
export const VERIFICATION_GATE_AT = "2026-10-15T02:13:06.000Z";

type AuthUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

export function accountVerificationState(input: {
  serverVerified?: boolean | null;
  createdAt?: string | null;
  vaultVerified?: boolean | null;
  google?: boolean;
  gateAt?: string;
}) {
  if (input.google || input.serverVerified === true || input.vaultVerified === true) {
    return { emailVerified: true, legacy: false };
  }
  if (input.serverVerified === false || input.vaultVerified === false) {
    return { emailVerified: false, legacy: false };
  }
  const gate = Date.parse(input.gateAt || VERIFICATION_GATE_AT);
  const created = input.createdAt ? Date.parse(input.createdAt) : NaN;
  const legacy = !Number.isFinite(created) || created < gate;
  return { emailVerified: false, legacy };
}

export function verificationFlag(metadata: unknown): boolean | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>)[VERIFICATION_META];
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

export function verifiedMetadata(metadata: Record<string, unknown> | null | undefined) {
  return {
    ...(metadata || {}),
    [VERIFICATION_META]: true,
    mapucoin_email_verified_at: new Date().toISOString(),
  };
}

function serviceRole(env: NodeJS.ProcessEnv) {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return { url, key };
}

export async function findAuthUserByEmail(
  email: string,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<AuthUser | null> {
  const auth = serviceRole(env);
  if (!auth) return null;
  const want = email.trim().toLowerCase();
  try {
    const endpoint = new URL(`${auth.url}/auth/v1/admin/users`);
    endpoint.searchParams.set("filter", want);
    endpoint.searchParams.set("page", "1");
    endpoint.searchParams.set("per_page", "50");
    const res = await fetchImpl(endpoint, {
      headers: { Authorization: `Bearer ${auth.key}`, apikey: auth.key },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { users?: AuthUser[] };
    return (
      (body.users || []).find((user) => (user.email || "").toLowerCase() === want) ||
      null
    );
  } catch {
    return null;
  }
}

export async function persistVerifiedAccount(opts: {
  userId: string;
  metadata?: Record<string, unknown> | null;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
}) {
  const env = opts.env || process.env;
  const auth = serviceRole(env);
  if (!auth || !opts.userId) return false;
  const fetchImpl = opts.fetchImpl || fetch;
  try {
    const res = await fetchImpl(`${auth.url}/auth/v1/admin/users/${opts.userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${auth.key}`,
        apikey: auth.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_metadata: verifiedMetadata(opts.metadata) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Writes the verified flag onto the auth user. No-ops without the service role. */
export async function persistVerifiedAccountByEmail(
  email: string,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const found = await findAuthUserByEmail(email, env, fetchImpl);
  if (!found) return false;
  return persistVerifiedAccount({
    userId: found.id,
    metadata: found.user_metadata,
    env,
    fetchImpl,
  });
}
