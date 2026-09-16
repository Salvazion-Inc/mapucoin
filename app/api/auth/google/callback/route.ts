import { NextResponse } from "next/server";
import {
  ACCOUNTS_COOKIE,
  accountsCookie,
  cookieValue,
  createSessionToken,
  readAccounts,
  sessionCookie,
  signAccounts,
  type AccountRecord,
} from "@/lib/session";
import {
  OAUTH_STATE_COOKIE,
  clearOauthStateCookie,
  exchangeGoogleCode,
  googleCallbackUrl,
  GOOGLE_MARKER,
  googleFailUrl,
  parseAuthFrom,
  publicOrigin,
  readOauthState,
  safeNext,
  type AuthFrom,
  type GoogleFailReason,
} from "@/lib/google-oauth";
import { ensureSupabaseUser } from "@/lib/supabase";

export const runtime = "nodejs";

function fail(
  req: Request,
  opts: { next: string; from: AuthFrom; reason: GoogleFailReason },
) {
  const res = NextResponse.redirect(googleFailUrl(req, opts));
  res.headers.append("Set-Cookie", clearOauthStateCookie());
  return res;
}

function dest(req: Request, next: string) {
  return new URL(safeNext(next), publicOrigin(req));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const googleError = url.searchParams.get("error");
  const nonce = url.searchParams.get("state");
  const state = await readOauthState(
    cookieValue(req.headers.get("cookie"), OAUTH_STATE_COOKIE),
  );
  const next = safeNext(state?.next || url.searchParams.get("next"));
  const from = parseAuthFrom(state?.from);

  if (googleError === "access_denied" || googleError === "user_cancelled") {
    return fail(req, { next, from, reason: "denied" });
  }

  if (!code || !nonce || !state || nonce !== state.nonce) {
    return fail(req, { next, from, reason: "failed" });
  }

  let exchanged;
  try {
    exchanged = await exchangeGoogleCode({
      code,
      verifier: state.verifier,
      callback: googleCallbackUrl(req),
    });
  } catch {
    return fail(req, { next, from, reason: "failed" });
  }
  if (!exchanged) return fail(req, { next, from, reason: "failed" });

  let user = {
    id: `google:${exchanged.profile.sub}`,
    email: exchanged.profile.email,
    name: exchanged.profile.name,
  };

  const saved = await ensureSupabaseUser(user.email, user.name);
  if (saved) user = saved;

  const users = await readAccounts(
    cookieValue(req.headers.get("cookie"), ACCOUNTS_COOKIE),
  );
  let account = users.find((u) => u.email === user.email);
  if (!account) {
    account = {
      id: user.id,
      email: user.email,
      name: user.name,
      hash: GOOGLE_MARKER,
    } satisfies AccountRecord;
    users.push(account);
    if (users.length > 25) users.splice(0, users.length - 25);
  } else if (!account.name || account.name === account.email) {
    account.name = user.name;
  }
  account.id = user.id;

  const session = await createSessionToken({
    id: account.id,
    email: account.email,
    name: account.name,
  });
  const vault = await signAccounts(users);
  const res = NextResponse.redirect(dest(req, next));
  res.headers.append("Set-Cookie", sessionCookie(session));
  res.headers.append("Set-Cookie", accountsCookie(vault));
  res.headers.append("Set-Cookie", clearOauthStateCookie());
  return res;
}
