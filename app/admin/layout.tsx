import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin partners",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-night text-sand">
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
