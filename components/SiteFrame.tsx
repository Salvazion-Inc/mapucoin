"use client";

import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const hide =
    path.startsWith("/app") || path === "/login" || path === "/signup";

  if (hide) return <>{children}</>;

  return (
    <>
      <Header />
      <HashScroll />
      {children}
      <Footer />
    </>
  );
}
