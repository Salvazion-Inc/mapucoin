import { NextResponse } from "next/server";
import {
  createEmailVerifyToken,
  deliverVerificationEmail,
  verificationLinkExposed,
  verificationUrl,
} from "@/lib/email-verification";
import { hashPassword } from "@/lib/passwords";
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
import { safeNextPath } from "@/lib/verified-access";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.full_name || body.name || "").trim();
  const password = String(body.password || "");
  if (!name) {
    return NextResponse.json({ error: "name" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "password" }, { status: 400 });
  }

  const users = await readAccounts(
    cookieValue(req.headers.get("cookie"), ACCOUNTS_COOKIE),
  );
  if (users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "exists" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const account: AccountRecord = {
    id,
    email,
    name,
    hash: hashPassword(password),
    emailVerified: false,
  };
  users.push(account);
  if (users.length > 25) users.splice(0, users.length - 25);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.admin.createUser({
        email,
        password,
        // Supabase confirm stays on so password login keeps working.
        // Mapucoin's own emailVerified flag is what gates services.
        id,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          mapucoin_email_verified: false,
        },
      });
    } catch {
      /* local session still works */
    }
    try {
      await supabase
        .from("profiles")
        .upsert({ id, full_name: name, email, role: "traveler" });
    } catch {
      /* optional */
    }
  }

  const session = await createSessionToken({
    id,
    email,
    name,
    emailVerified: false,
  });
  const vault = await signAccounts(users);
  const verifyToken = await createEmailVerifyToken(email);
  const devUrl = verificationUrl(req, verifyToken, safeNextPath(String(body.next || "/app")));
  const delivered = await deliverVerificationEmail({ to: email, name, url: devUrl });
  const res = NextResponse.json({
    user: { id, email, name, emailVerified: false },
    verificationRequired: true,
    delivered,
    devUrl: verificationLinkExposed() ? devUrl : undefined,
  });
  res.headers.append("Set-Cookie", sessionCookie(session));
  res.headers.append("Set-Cookie", accountsCookie(vault));
  return res;
}
