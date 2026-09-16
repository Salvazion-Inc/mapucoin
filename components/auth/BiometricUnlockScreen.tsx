"use client";

import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import { FingerprintMark } from "./FingerprintMark";

export function BiometricUnlockScreen({
  title,
  subtitle,
  status,
  email,
  busy,
  error,
  promptLabel,
  onPrompt,
  footer,
}: {
  title: string;
  subtitle: string;
  status: string;
  email?: string | null;
  busy: boolean;
  error?: string | null;
  promptLabel: string;
  onPrompt: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-sm text-center">
      <div className="mx-auto mb-5 flex justify-center">
        <BrandMark size={64} />
      </div>
      <h1 className="font-display text-2xl font-bold text-gold">{title}</h1>
      <p className="mt-1.5 text-sm text-sand/70">{subtitle}</p>
      {email ? (
        <p className="mt-2 text-[11px] leading-relaxed text-sand/50">{email}</p>
      ) : null}

      <button
        type="button"
        onClick={onPrompt}
        disabled={busy}
        className={`fingerprint-unlock-btn mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full border border-gold bg-gold/15 text-gold transition disabled:opacity-70 ${
          busy ? "fingerprint-unlock-btn-busy" : ""
        }`}
        aria-label={promptLabel}
      >
        <FingerprintMark size={44} />
      </button>
      <p className="mt-4 text-sm font-medium text-gold" aria-live="polite">
        {status}
      </p>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-clay">
          {error}
        </p>
      ) : null}
      {footer ? <div className="mt-10">{footer}</div> : null}
    </div>
  );
}
