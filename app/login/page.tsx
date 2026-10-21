import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { googleReasonFromSearch } from "@/lib/google-oauth";
import { pageTitle } from "@/lib/seo";

export const metadata = { title: pageTitle("Entrar | Mapucoin") };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; auth?: string; reason?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Suspense>
      <AuthForm mode="login" googleReason={googleReasonFromSearch(sp)} />
    </Suspense>
  );
}
