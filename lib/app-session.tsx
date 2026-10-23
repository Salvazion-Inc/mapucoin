"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "./session";

const SessionContext = createContext<SessionUser | null>(null);

export function AppSessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useAppSessionUser() {
  return useContext(SessionContext);
}
