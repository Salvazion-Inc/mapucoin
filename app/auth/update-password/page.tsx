import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { pageTitle } from "@/lib/seo";

export const metadata = {
  title: pageTitle("Nueva contraseña | Mapucoin"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UpdatePasswordForm />;
}
