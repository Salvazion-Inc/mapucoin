"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";
import { safeNextPath } from "@/lib/service-redirect";

const DEV_KEY = "mapucoin_dev_verify_url";

export function VerifyEmailScreen() {
  const { locale } = useLocale();
  const a = at(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNextPath(search.get("next"));
  const tokenError = search.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "sent" | "err">(
    "loading",
  );
  const [devUrl, setDevUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    const stored = sessionStorage.getItem(DEV_KEY) || "";
    if (stored) setDevUrl(stored);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: { email?: string; emailVerified?: boolean } | null }) => {
        if (cancelled) return;
        const user = data.user;
        if (!user?.email) {
          router.replace(`/signup?next=${encodeURIComponent(next)}`);
          return;
        }
        if (user.emailVerified) {
          router.replace(next);
          return;
        }
        setEmail(user.email);
        setStatus(tokenError ? "err" : "ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("err");
      });
    return () => {
      cancelled = true;
    };
  }, [next, router, tokenError]);

  async function resend() {
    setStatus("loading");
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) {
      setStatus("err");
      return;
    }
    if (typeof data.devUrl === "string" && data.devUrl) {
      sessionStorage.setItem(DEV_KEY, data.devUrl);
      setDevUrl(data.devUrl);
    }
    setStatus("sent");
  }

  return (
    <div className="min-h-dvh bg-night px-5 pb-16 pt-10 text-sand">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={56} priority />
          <span className="font-display tracking-[0.16em] text-gold">MAPUCOIN</span>
        </Link>
        <LanguageSwitcher compact />
      </div>
      <section className="mx-auto mt-12 max-w-md">
        <p className="text-sm text-gold">{a.verifyKicker}</p>
        <h1 className="font-display mt-2 text-4xl font-bold">{a.verifyTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-sand/75">{a.verifyLead}</p>
        <div className="mt-8 rounded-2xl border border-gold/20 bg-black/70 p-6">
          {email ? (
            <p className="text-sm text-sand">
              {email}
            </p>
          ) : (
            <p className="text-sm text-sand/50">{a.verifyChecking}</p>
          )}
          {status === "err" || tokenError ? (
            <p className="mt-4 text-sm text-clay" role="alert">
              {a.verifyInvalid}
            </p>
          ) : null}
          {status === "sent" ? (
            <p className="mt-4 text-sm text-gold">{a.verifySent}</p>
          ) : null}
          {devUrl ? (
            <p className="mt-4 text-sm text-sand/80">
              {a.verifyDev}{" "}
              <a className="text-gold underline" href={devUrl}>
                {a.verifyOpenLink}
              </a>
            </p>
          ) : null}
          <button
            type="button"
            onClick={resend}
            disabled={status === "loading" || !email}
            className="btn-gold mt-6 w-full !py-3 disabled:opacity-60"
          >
            {status === "loading" ? a.sending : a.verifyResend}
          </button>
        </div>
        <p className="mt-6 text-sm text-sand/70">
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-gold">
            {a.haveAccount}
          </Link>
        </p>
      </section>
    </div>
  );
}
