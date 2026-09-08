"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GastronomiaRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#gastronomia");
  }, [router]);
  return (
    <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
      Llevándote a gastronomía…
    </p>
  );
}
