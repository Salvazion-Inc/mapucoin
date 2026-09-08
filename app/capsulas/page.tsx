"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CapsulasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#capsulas");
  }, [router]);
  return (
    <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
      Llevándote a las cápsulas…
    </p>
  );
}
