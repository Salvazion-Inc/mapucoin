"use client";

import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export default function SiteFrame({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: { id: string; email: string; name: string } | null;
}) {
  const path = usePathname() || "/";
  const hide =
    path.startsWith("/app") ||
    path === "/login" ||
    path === "/signup" ||
    path === "/verificar" ||
    path === "/recuperar" ||
    path.startsWith("/auth") ||
    path.startsWith("/admin");

  if (hide) return <>{children}</>;

  return (
    <>
      <Header initialUser={initialUser} />
      <HashScroll />
      {children}
      <Footer />
    </>
  );
}
