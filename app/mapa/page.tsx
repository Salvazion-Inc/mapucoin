"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MapaRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#mapa");
  }, [router]);
  return (
    <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
      Llevándote al mapa…
    </p>
  );
}
