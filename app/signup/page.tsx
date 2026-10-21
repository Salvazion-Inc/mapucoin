import { Suspense } from "react";
import { cookies } from "next/headers";
import { AuthForm } from "@/components/AuthForm";
import { googleReasonFromSearch } from "@/lib/google-oauth";
import { pageTitle } from "@/lib/seo";
import { readSession, SESSION_COOKIE } from "@/lib/session";

export const metadata = { title: pageTitle("Crear cuenta | Mapucoin") };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; auth?: string; reason?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const jar = await cookies();
  const session = await readSession(jar.get(SESSION_COOKIE)?.value);
  return (
    <Suspense>
      <AuthForm
        mode="signup"
        emailVerified={session?.emailVerified === true}
        googleReason={googleReasonFromSearch(sp)}
      />
    </Suspense>
  );
}
