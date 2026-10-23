import { NextResponse } from "next/server";
import {
  accountVerificationState,
  persistVerifiedAccount,
  verificationFlag,
} from "@/lib/account-verification";
import { verifyPassword } from "@/lib/passwords";
import {
  ACCOUNTS_COOKIE,
  accountsCookie,
  authSecretFailureResponse,
  cookieValue,
  createSessionToken,
  readAccounts,
  sessionCookie,
  sessionVersionOf,
  signAccounts,
  type AccountRecord,
} from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

type ServerUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: { provider?: string; session_version?: unknown };
  identities?: { provider?: string }[] | null;
};

function vaultFlag(account: AccountRecord | undefined) {
  if (!account || account.emailVerified === undefined) return null;
  return account.emailVerified === true;
}

function isGoogle(user: ServerUser) {
  if (user.app_metadata?.provider === "google") return true;
  return (user.identities || []).some((item) => item.provider === "google");
}

export async function POST(req: Request) {
  const blocked = authSecretFailureResponse();
  if (blocked) return blocked;

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "credentials" }, { status: 400 });
  }

  const users = await readAccounts(
    cookieValue(req.headers.get("cookie"), ACCOUNTS_COOKIE),
  );
  const local = users.find((user) => user.email === email);
  const localOk = Boolean(local && verifyPassword(password, local.hash));

  let serverUser: ServerUser | null = null;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data.user) serverUser = data.user;
    } catch {
      /* cookie vault can still sign the same browser in */
    }
  }

  if (!serverUser && !localOk) {
    return NextResponse.json({ error: "credentials" }, { status: 401 });
  }

  const state = accountVerificationState({
    serverVerified: serverUser ? verificationFlag(serverUser.user_metadata) : null,
    createdAt: serverUser?.created_at ?? null,
    vaultVerified: vaultFlag(local),
    google: serverUser ? isGoogle(serverUser) : false,
  });

  if (
    state.emailVerified &&
    serverUser &&
    verificationFlag(serverUser.user_metadata) !== true
  ) {
    await persistVerifiedAccount({
      userId: serverUser.id,
      metadata: serverUser.user_metadata,
    });
  }

  const account = local;
  if (account && state.emailVerified) account.emailVerified = true;
  const user = {
    id: serverUser?.id || account?.id || email,
    email: (serverUser?.email || account?.email || email).toLowerCase(),
    name:
      account?.name ||
      String(serverUser?.user_metadata?.full_name || "") ||
      email,
    emailVerified: state.emailVerified,
    legacyVerification: state.legacy && !state.emailVerified,
  };
  const session = await createSessionToken({
    ...user,
    sessionVersion: serverUser
      ? sessionVersionOf(serverUser.app_metadata?.session_version)
      : undefined,
  });
  const res = NextResponse.json({ user });
  res.headers.append("Set-Cookie", sessionCookie(session));
  if (account && state.emailVerified) {
    res.headers.append("Set-Cookie", accountsCookie(await signAccounts(users)));
  }
  return res;
}
