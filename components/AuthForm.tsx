"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { BiometricLogin } from "@/components/auth/BiometricLogin";
import { useBiometricGate } from "@/components/auth/useBiometric";
import { at } from "@/lib/app-copy";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";

export function AuthForm({
  mode,
  googleReason,
}: {
  mode: "login" | "signup";
  googleReason?: string;
}) {
  const { locale } = useLocale();
  const a = at(locale);
  const site = t(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/app";
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");
  const [message, setMessage] = useState("");
  const [passwordFallback, setPasswordFallback] = useState(false);
  const { ready: biometricReady, enabled: biometricEnabled } = useBiometricGate();
  const thumbGate =
    mode === "login" && biometricReady && biometricEnabled && !passwordFallback;
  const waitingGate = mode === "login" && !biometricReady;
  const reason =
    googleReason ||
    (search.get("auth") === "google" ? search.get("reason") : null) ||
    (search.get("error") === "google" ? "failed" : null);
  const googleMessage =
    reason === "unconfigured"
      ? a.googleUnconfigured
      : reason === "denied"
        ? a.googleDenied
        : reason
          ? a.googleError
          : "";

  const field =
    "mt-2 w-full rounded-xl border border-gold/25 bg-black px-4 py-3 text-sand outline-none focus:border-gold";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const full_name = String(form.get("full_name") || "");
    const confirm = String(form.get("confirm") || "");
    if (mode === "signup") {
      if (!full_name.trim()) {
        setStatus("err");
        setMessage(a.nameRequired);
        return;
      }
      if (password.length < 8) {
        setStatus("err");
        setMessage(a.passwordShort);
        return;
      }
      if (password !== confirm) {
        setStatus("err");
        setMessage(a.passwordMismatch);
        return;
      }
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name }),
        },
      );
      if (!res.ok) throw new Error("auth");
      router.replace(next.startsWith("/") ? next : "/app");
      router.refresh();
    } catch {
      setStatus("err");
      setMessage(mode === "login" ? a.loginError : a.signupError);
    }
  }

  return (
    <div className="min-h-dvh bg-night px-5 pb-16 pt-10 text-sand">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={40} priority />
          <span className="font-display tracking-[0.16em] text-gold">MAPUCOIN</span>
        </Link>
        <LanguageSwitcher compact />
      </div>
      <section className="mx-auto mt-12 max-w-md">
        {waitingGate ? (
          <p className="text-sm text-sand/50">{a.biometricProcessing}</p>
        ) : thumbGate ? (
          <BiometricLogin
            locale={locale}
            next={next}
            onUsePassword={() => setPasswordFallback(true)}
          />
        ) : (
          <>
        <p className="text-sm text-gold">{a.sessionNeeded}</p>
        <h1 className="font-display mt-2 text-4xl font-bold">
          {mode === "login" ? a.loginTitle : a.signupTitle}
        </h1>
        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-gold/20 bg-black/70 p-6"
        >
          {message || googleMessage ? (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-sand"
            >
              {message || googleMessage}
            </div>
          ) : null}
          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}&from=${mode}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/25 bg-night py-3 text-sm font-semibold hover:border-gold"
          >
            <GoogleMark />
            {a.googleCta}
          </a>
          <p className="my-5 text-center text-xs font-semibold uppercase tracking-wider text-sand/40">
            {a.orContinue}
          </p>
          {mode === "signup" ? (
            <label className="block text-sm font-semibold">
              {site.partners.name}
              <input className={field} name="full_name" required />
            </label>
          ) : null}
          <label className="mt-4 block text-sm font-semibold">
            {site.partners.email}
            <input className={field} type="email" name="email" required />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            {a.password}
            <input
              className={field}
              type="password"
              name="password"
              minLength={8}
              required
            />
          </label>
          {mode === "signup" ? (
            <label className="mt-4 block text-sm font-semibold">
              {a.passwordConfirm}
              <input
                className={field}
                type="password"
                name="confirm"
                minLength={8}
                required
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-gold mt-6 w-full !py-3 disabled:opacity-60"
          >
            {status === "sending"
              ? a.sending
              : mode === "login"
                ? a.loginCta
                : a.signupCta}
          </button>
        </form>
        <p className="mt-6 text-sm text-sand/70">
          {mode === "login" ? (
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-gold">
              {a.needAccount}
            </Link>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-gold">
              {a.haveAccount}
            </Link>
          )}
        </p>
          </>
        )}
      </section>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.76-.07-1.49-.2-2.2H12v4.16h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.22c1.89-1.74 2.98-4.3 2.98-7.49z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.22-2.5c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.58A10 10 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.91A6.01 6.01 0 0 1 6.08 12c0-.66.11-1.31.3-1.91V7.51H3.06A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.49l3.33-2.58z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.97 14.7 2 12 2 7.96 2 4.47 4.31 3.06 7.51l3.33 2.58C7.18 7.72 9.39 5.96 12 5.96z"
      />
    </svg>
  );
}
