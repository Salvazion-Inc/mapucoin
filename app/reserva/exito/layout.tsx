import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserva confirmada",
  robots: { index: false, follow: false },
};

export default function ExitoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
