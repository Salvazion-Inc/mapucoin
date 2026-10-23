"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";

const field =
  "mt-2 w-full rounded-xl border border-gold/25 bg-black px-4 py-3 text-sand outline-none focus:border-gold";

export function ForgotPasswordForm() {
  const { locale } = useLocale();
  const a = at(locale);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "");
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setStatus("err");
        setMessage(a.forgotRateLimited);
        return;
      }
      if (res.status === 400) {
        setStatus("err");
        setMessage(a.account.emailError);
        return;
      }
      setStatus("sent");
      setMessage(a.forgotSent);
    } catch {
      setStatus("err");
      setMessage(a.forgotRateLimited);
    }
  }

  return (
    <AuthScreen>
      <h1 className="font-display text-4xl font-bold">{a.forgotTitle}</h1>
      <p className="mt-3 text-sm leading-relaxed text-sand/75">{a.forgotLead}</p>
      {message ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-sand"
        >
          {message}
        </div>
      ) : null}
      {status === "sent" ? null : (
        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-gold/20 bg-black/70 p-6"
        >
          <label className="block text-sm font-semibold">
            {a.account.email}
            <input className={field} type="email" name="email" autoComplete="email" required />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-gold mt-6 w-full !py-3 disabled:opacity-60"
          >
            {status === "sending" ? a.sending : a.forgotCta}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-gold">
          {a.forgotBack}
        </Link>
      </p>
    </AuthScreen>
  );
}
