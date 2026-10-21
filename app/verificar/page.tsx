import { Suspense } from "react";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";
import { pageTitle } from "@/lib/seo";

export const metadata = {
  title: pageTitle("Verifica tu correo | Mapucoin"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailScreen />
    </Suspense>
  );
}
