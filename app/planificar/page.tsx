"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const q = params.toString();
    router.replace(q ? `/?${q}#planificar` : "/#planificar");
  }, [params, router]);

  return (
    <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
      Llevándote al planificador…
    </p>
  );
}

export default function PlanificarRedirect() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-7xl px-4 py-20 text-sand/70">
          Llevándote al planificador…
        </p>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
