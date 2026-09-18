import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar cápsula",
  robots: { index: true, follow: true },
};

export default function ReservaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
