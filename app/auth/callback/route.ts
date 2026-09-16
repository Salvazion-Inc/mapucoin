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
  ACCOUNTS_COOKIE,
  accountsCookie,
  cookieValue,
  createSessionToken,
  readAccounts,
  sessionCookie,
  signAccounts,
  type AccountRecord,
} from "@/lib/session";
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

  const session = await createSessionToken({
    id: account.id,
    email: account.email,
    name: account.name,
  });
  const vault = await signAccounts(users);
  const res = applyCookies(NextResponse.redirect(new URL(next, origin)), pending);
  res.headers.append("Set-Cookie", sessionCookie(session));
  res.headers.append("Set-Cookie", accountsCookie(vault));
  return res;
}
