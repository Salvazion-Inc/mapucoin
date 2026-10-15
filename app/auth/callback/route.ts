import { NextResponse } from "next/server";
import { applyCookies, createRouteSupabase } from "@/lib/supabase-route";
import {
  GOOGLE_MARKER,
  googleFailUrl,
  parseAuthFrom,
  publicOrigin,
  safeNext,
} from "@/lib/google-oauth";
import {
  accountVerificationState,
  persistVerifiedAccount,
  verificationFlag,
} from "@/lib/account-verification";
import { rememberVerifiedEmail } from "@/lib/email-verification";
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
import { safeNextPath } from "@/lib/verified-access";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const from = parseAuthFrom(url.searchParams.get("from"));
  const origin = publicOrigin(req);

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "denied" }),
    );
  }
  if (!code) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "failed" }),
    );
  }

  const pending: Parameters<typeof applyCookies>[1] = [];
  const supabase = createRouteSupabase(req, pending);
  if (!supabase) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "unconfigured" }),
    );
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "failed" }),
    );
  }

  const user = {
    id: data.user.id,
    email: (data.user.email || "").toLowerCase(),
    name:
      String(data.user.user_metadata?.full_name || data.user.user_metadata?.name || "") ||
      (data.user.email || "Mapucoin"),
  };

  const db = getSupabase();
  if (db) {
    try {
      await db.from("profiles").upsert({
        id: user.id,
        full_name: user.name,
        role: "client",
      });
    } catch {
      /* optional */
    }
  }

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
  } else {
    account.id = user.id;
    if (!account.name || account.name === account.email) account.name = user.name;
  }

  const identities = data.user.identities || [];
  const provider = String(data.user.app_metadata?.provider || "");
  const google =
    provider === "google" || identities.some((item) => item.provider === "google");
  const state = accountVerificationState({
    serverVerified: verificationFlag(data.user.user_metadata),
    createdAt: data.user.created_at,
    vaultVerified:
      account.emailVerified === undefined ? null : account.emailVerified === true,
    google,
  });
  const emailVerified = state.emailVerified;
  if (emailVerified) account.emailVerified = true;
  if (emailVerified) {
    await persistVerifiedAccount({
      userId: data.user.id,
      metadata: data.user.user_metadata,
    });
  }

  const session = await createSessionToken({
    id: account.id,
    email: account.email,
    name: account.name,
    emailVerified,
    legacyVerification: state.legacy && !emailVerified,
  });
  const vault = await signAccounts(users);
  const dest = emailVerified
    ? next
    : `/verificar?next=${encodeURIComponent(safeNextPath(next))}`;
  const res = applyCookies(NextResponse.redirect(new URL(dest, origin)), pending);
  res.headers.append("Set-Cookie", sessionCookie(session));
  res.headers.append("Set-Cookie", accountsCookie(vault));
  if (emailVerified) {
    res.headers.append(
      "Set-Cookie",
      await rememberVerifiedEmail(req.headers.get("cookie"), account.email),
    );
  }
  return res;
}
