"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProfileRole, UserProfile } from "./profile";

export type ProfileSaveInput = {
  fullName: string;
  email: string;
  phone: string;
  role: ProfileRole;
  instagram: string;
  city: string;
  cityLat: number | null;
  cityLng: number | null;
};

type Ctx = {
  profile: UserProfile | null;
  ready: boolean;
  save: (input: ProfileSaveInput) => Promise<UserProfile>;
  refresh: () => Promise<void>;
};

const ProfileCtx = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.profile ?? null);
    } catch {
      setProfile(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (input: ProfileSaveInput) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(String(data.error || "save"));
    }
    const next = data.profile as UserProfile;
    setProfile(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({ profile, ready, save, refresh }),
    [profile, ready, save, refresh],
  );

  return (
    <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) {
    return {
      profile: null,
      ready: true,
      save: async () => {
        throw new Error("save");
      },
      refresh: async () => {},
    };
  }
  return ctx;
}
