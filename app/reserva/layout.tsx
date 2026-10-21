import type { Metadata } from "next";
import { pageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: pageTitle("Reservar cápsula"),
  robots: { index: true, follow: true },
};

export default function ReservaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
