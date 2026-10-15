import { Suspense } from "react";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";

export const metadata = {
  title: "Verifica tu correo | Mapucoin",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailScreen />
    </Suspense>
  );
}
