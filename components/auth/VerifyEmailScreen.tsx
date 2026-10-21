"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { at } from "@/lib/app-copy";
import { disableBiometric } from "@/lib/auth/biometric";
import { useLocale } from "@/lib/locale-context";
import { loginPathFromVerify, safeNextPath } from "@/lib/service-redirect";
import { verifyMailFeedback } from "@/lib/verify-feedback";

const DEV_KEY = "mapucoin_dev_verify_url";
const DELIVERED_KEY = "mapucoin_verify_delivered";

export function VerifyEmailScreen() {
  const { locale } = useLocale();
  const a = at(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNextPath(search.get("next"));
  const tokenError = search.get("error");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [devUrl, setDevUrl] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [legacy, setLegacy] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(DELIVERED_KEY) === "false") setFailed(true);
    if (sessionStorage.getItem(DELIVERED_KEY) === "true") setSent(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const search = window.location.search;
    const preserved = safeNextPath(
      new URLSearchParams(search).get("next"),
    );
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: { email?: string; emailVerified?: boolean; legacyVerification?: boolean } | null }) => {
        if (cancelled) return;
        const user = data.user;
        if (!user?.email) {
          setHasSession(false);
          router.replace(loginPathFromVerify(search));
          return;
        }
        setHasSession(true);
        if (user.emailVerified) {
          router.replace(preserved);
          return;
        }
        setLegacy(user.legacyVerification === true);
        setEmail(user.email);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!ready || !email || devUrl) return;
    let cancelled = false;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next, linkOnly: true }),
    })
      .then((res) => res.json())
      .then((data: { devUrl?: string }) => {
        if (cancelled) return;
        if (typeof data.devUrl === "string" && data.devUrl) {
          sessionStorage.setItem(DEV_KEY, data.devUrl);
          setDevUrl(data.devUrl);
          return;
        }
        sessionStorage.removeItem(DEV_KEY);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, email, devUrl, next]);

  useEffect(() => {
    if (waitSeconds <= 0) return;
    const id = setTimeout(() => setWaitSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(id);
  }, [waitSeconds]);

  async function resend() {
    if (pending || waitSeconds > 0 || !email) return;
    setPending(true);
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next }),
    }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          delivered?: boolean;
          retryAfter?: number;
          devUrl?: string;
        })
      : {};
    const notice = verifyMailFeedback({
      delivered: res ? data.delivered : false,
      retryAfter: data.retryAfter,
      httpStatus: res ? res.status : 0,
    });
    if (notice.sent) {
      setSent(true);
      setFailed(false);
      sessionStorage.setItem(DELIVERED_KEY, "true");
    }
    if (notice.failed) {
      setFailed(true);
      setSent(false);
      sessionStorage.setItem(DELIVERED_KEY, "false");
    }
    if (notice.waitSeconds > 0) setWaitSeconds(notice.waitSeconds);
    if (typeof data.devUrl === "string" && data.devUrl) {
      sessionStorage.setItem(DEV_KEY, data.devUrl);
      setDevUrl(data.devUrl);
    } else {
      sessionStorage.removeItem(DEV_KEY);
      setDevUrl("");
    }
    setPending(false);
  }

  const canResend = ready && Boolean(email) && !pending && waitSeconds <= 0;

  function leave(kind: "entrar" | "salir") {
    if (!hydrated) return;
    try {
      sessionStorage.removeItem(DEV_KEY);
      sessionStorage.removeItem(DELIVERED_KEY);
      disableBiometric();
    } catch {
      /* the logout URL still clears the cookies */
    }
    const preserved = safeNextPath(
      new URLSearchParams(window.location.search).get("next"),
    );
    const href =
      kind === "salir"
        ? "/api/auth/logout?next=/"
        : `/api/auth/logout?next=${encodeURIComponent(`/login?next=${encodeURIComponent(preserved)}`)}`;
    window.location.assign(href);
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
            <p className="text-sm text-sand">{email}</p>
          ) : (
            <p className="text-sm text-sand/50">{a.verifyChecking}</p>
          )}
          {tokenError ? (
            <p className="mt-4 text-sm text-clay" role="alert">
              {a.verifyInvalid}
            </p>
          ) : null}
          {legacy ? (
            <p className="mt-4 text-sm leading-relaxed text-sand" role="status">
              {a.verifyLegacy}
            </p>
          ) : null}
          {failed ? (
            <p className="mt-4 text-sm leading-relaxed text-clay" role="alert">
              {a.verifyNotSent}
            </p>
          ) : null}
          {sent ? (
            <p className="mt-4 text-sm text-gold" role="status">
              {a.verifySent}
            </p>
          ) : null}
          {waitSeconds > 0 ? (
            <p className="mt-4 text-sm text-sand" role="status">
              {a.verifyWait.replaceAll("{n}", String(waitSeconds))}
            </p>
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
            disabled={!canResend}
            className="btn-gold mt-6 w-full !py-3 disabled:opacity-60"
          >
            {pending ? a.sending : a.verifyResend}
          </button>
        </div>
        <p className="mt-6 flex items-center justify-between gap-4 text-sm text-sand/70">
          {hasSession === false ? (
            <button
              type="button"
              disabled={!hydrated}
              onClick={() => leave("entrar")}
              className="text-gold disabled:opacity-60"
            >
              {a.haveAccount}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!hydrated}
            onClick={() => leave("salir")}
            className="text-gold disabled:opacity-60"
          >
            {a.account.logout}
          </button>
        </p>
      </section>
    </div>
  );
}
