"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";

const field =
  "mt-2 w-full rounded-xl border border-gold/25 bg-black px-4 py-3 text-sand outline-none focus:border-gold";

export function UpdatePasswordForm() {
  const { locale } = useLocale();
  const a = at(locale);
  const [ready, setReady] = useState<"checking" | "ready" | "expired">("checking");
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancel = false;
    fetch("/api/auth/update-password")
      .then((res) => {
        if (!cancel) setReady(res.ok ? "ready" : "expired");
      })
      .catch(() => {
        if (!cancel) setReady("expired");
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
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
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 429) {
        setStatus("err");
        setMessage(a.forgotRateLimited);
        return;
      }
      if (!res.ok) {
        if (data.error === "password") {
          setStatus("err");
          setMessage(a.passwordShort);
          return;
        }
        if (data.error === "mismatch") {
          setStatus("err");
          setMessage(a.passwordMismatch);
          return;
        }
        setReady("expired");
        return;
      }
      window.location.assign("/login");
    } catch {
      setStatus("err");
      setMessage(a.forgotRateLimited);
    }
  }

  return (
    <AuthScreen>
      <h1 className="font-display text-4xl font-bold">{a.updateTitle}</h1>
      <p className="mt-3 text-sm leading-relaxed text-sand/75">{a.updateLead}</p>
      {message ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-sand"
        >
          {message}
        </div>
      ) : null}
      {ready === "checking" ? (
        <p className="mt-8 text-sm text-sand/70">{a.verifyChecking}</p>
      ) : null}
      {ready === "expired" ? (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-black/70 p-6">
          <p className="text-sm leading-relaxed text-sand/80">{a.updateExpired}</p>
          <Link href="/recuperar" className="btn-gold mt-6 inline-flex !py-3">
            {a.updateAgain}
          </Link>
        </div>
      ) : null}
      {ready === "ready" ? (
        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-gold/20 bg-black/70 p-6"
        >
          <label className="block text-sm font-semibold">
            {a.password}
            <input
              className={field}
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            {a.passwordConfirm}
            <input
              className={field}
              type="password"
              name="confirm"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-gold mt-6 w-full !py-3 disabled:opacity-60"
          >
            {status === "sending" ? a.sending : a.updateCta}
          </button>
        </form>
      ) : null}
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-gold">
          {a.forgotBack}
        </Link>
      </p>
    </AuthScreen>
  );
}
