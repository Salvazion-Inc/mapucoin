"use client";

import type { AppTab } from "@/lib/app-copy";
import { AccountTab } from "./AccountTab";
import { AppShell } from "./AppShell";
import { CapsulesTab } from "./CapsulesTab";
import { ExploreTab } from "./ExploreTab";
import { MesaTab } from "./MesaTab";
import { TripTab } from "./TripTab";

export function MapucoinApp({ tab }: { tab: AppTab }) {
  const body =
    tab === "explorar" ? (
      <ExploreTab />
    ) : tab === "capsulas" ? (
      <CapsulesTab />
    ) : tab === "viaje" ? (
      <TripTab />
    ) : tab === "mesa" ? (
      <MesaTab />
    ) : (
      <AccountTab />
    );

  return <AppShell tab={tab}>{body}</AppShell>;
}
