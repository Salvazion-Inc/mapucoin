"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";
import { useProfile } from "@/lib/profile-store";
import type { SessionUser } from "@/lib/session";
import { ProfileAvatar } from "./app/ProfileAvatar";

export function AccountChip() {
  const { locale } = useLocale();
  const a = at(locale);
  const { profile } = useProfile();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (!user) return null;

  async function logout() {
    const { disableBiometric } = await import("@/lib/auth/biometric");
    disableBiometric();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const label = profile?.fullName || user.name || user.email;

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/app/cuenta"
        className="flex max-w-[14rem] items-center gap-2 text-[11px] text-sand/70 hover:text-sand"
      >
        <ProfileAvatar name={label} size={28} />
        <span className="hidden truncate sm:inline">
          {label}
          {profile?.role ? (
            <span className="text-gold"> · {a.account.roles[profile.role]}</span>
          ) : null}
        </span>
      </Link>
      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-sand/25 px-2 py-1 text-[11px] text-sand/80"
      >
        {a.account.logout}
      </button>
    </div>
  );
}
