import type { Metadata } from "next";
import { composeDocumentTitle } from "@/lib/seo";

export const metadata: Metadata = {
  // Nested under /reserva, whose layout sets a string title and stops the
  // root template from reaching this segment.
  title: { absolute: composeDocumentTitle("Reserva confirmada") },
  robots: { index: false, follow: false },
};

export default function ExitoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
