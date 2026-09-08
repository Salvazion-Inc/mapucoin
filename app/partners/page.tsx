"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PartnersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#partners");
  }, [router]);
  return (
    <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
      Llevándote a partners…
    </p>
  );
}
