"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { at } from "@/lib/app-copy";
import { formatCLP, getBySlug } from "@/lib/catalog";
import { useLocale } from "@/lib/locale-context";
import { useLocation } from "@/lib/location";
import { PROFILE_ROLES, type ProfileRole } from "@/lib/profile";
import { useProfile } from "@/lib/profile-store";
import { ProfileAvatar } from "./ProfileAvatar";

type BookingRow = {
  id: string;
  capsule_slug?: string | null;
  yacht_slug?: string | null;
  nights?: number | null;
  guests?: number | null;
  amount?: number | null;
  status?: string | null;
  created_at?: string | null;
  destination?: string | null;
};

export function AccountTab() {
  const { locale } = useLocale();
  const a = at(locale);
  const { profile, ready, save } = useProfile();
  const { here, located } = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<ProfileRole>("traveler");
  const [instagram, setInstagram] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [errorKey, setErrorKey] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhone(profile.phone);
    setRole(profile.role || "traveler");
    setInstagram(profile.instagram ? `@${profile.instagram}` : "");
    setCity(profile.city || (located ? here.label : ""));
  }, [profile, located, here.label]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data.bookings) ? data.bookings : []))
      .catch(() => setBookings([]));
  }, []);

  if (!ready) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorKey("");
    try {
      await save({
        fullName,
        email,
        phone,
        role,
        instagram,
        city,
        cityLat: located ? here.lat : profile?.cityLat ?? null,
        cityLng: located ? here.lng : profile?.cityLng ?? null,
      });
      setStatus("ok");
    } catch (err) {
      setStatus("err");
      setErrorKey(err instanceof Error ? err.message : "save");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const errMsg =
    errorKey === "name"
      ? a.account.nameError
      : errorKey === "email"
        ? a.account.emailError
        : errorKey === "instagram"
          ? a.account.instagramError
          : a.account.saveError;

  return (
    <div>
      <div className="flex items-center gap-3">
        <ProfileAvatar name={fullName || email} size={52} />
        <div>
          <h1 className="font-display text-2xl font-bold">{a.tabs.cuenta}</h1>
          <p className="text-sm text-sand/70">{a.account.lead}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium">
          {a.account.name}
          <input
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {a.account.email}
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {a.account.phone}
          <input
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          {a.account.city}
          <input
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          {a.account.instagram}
          <input
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@mapucoin"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">{a.account.role}</legend>
          <div className="mt-2 flex gap-2">
            {PROFILE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  role === r ? "bg-gold text-night" : "border border-gold/30 text-sand"
                }`}
              >
                {a.account.roles[r]}
              </button>
            ))}
          </div>
        </fieldset>
        {status === "ok" ? (
          <p className="text-sm text-gold">{a.account.saved}</p>
        ) : null}
        {status === "err" ? <p className="text-sm text-clay">{errMsg}</p> : null}
        <button
          type="submit"
          disabled={status === "saving"}
          className="btn-gold w-full !py-3 disabled:opacity-60"
        >
          {status === "saving" ? a.account.saving : a.account.save}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-display text-xl">{a.account.bookings}</h2>
        {bookings.length === 0 ? (
          <p className="mt-2 text-sm text-sand/60">{a.account.noBookings}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {bookings.map((b) => {
              const slug = b.capsule_slug || b.yacht_slug || "";
              const item = slug ? getBySlug(slug) : null;
              return (
                <li
                  key={b.id}
                  className="rounded-2xl border border-gold/15 bg-sand/[0.03] px-4 py-3 text-sm"
                >
                  <p className="font-semibold">{item?.name || slug || b.destination}</p>
                  <p className="text-sand/60">
                    {b.status} · {b.nights ? `${b.nights} · ` : ""}
                    {typeof b.amount === "number" ? formatCLP(b.amount) : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-gold/20 p-4">
        <p className="text-sm text-sand/70">{a.account.partnerLead}</p>
        <Link href="/partners" className="mt-3 inline-flex btn-ghost !py-2 text-sm">
          {a.account.partnerCta}
        </Link>
      </section>

      <button
        type="button"
        onClick={logout}
        className="mt-8 w-full rounded-full border border-sand/25 py-3 text-sm text-sand/80"
      >
        {a.account.logout}
      </button>
    </div>
  );
}
