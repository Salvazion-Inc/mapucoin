import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { pageTitle } from "@/lib/seo";

export const metadata = {
  title: pageTitle("Recuperar contraseña | Mapucoin"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPasswordForm />;
}
