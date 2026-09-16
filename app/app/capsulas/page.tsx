"use client";

import { Suspense } from "react";
import { MapucoinApp } from "@/components/app/MapucoinApp";

export default function Page() {
  return (
    <Suspense>
      <MapucoinApp tab="capsulas" />
    </Suspense>
  );
}
