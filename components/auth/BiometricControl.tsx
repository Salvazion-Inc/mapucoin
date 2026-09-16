"use client";

import { useEffect, useState } from "react";
import {
  BiometricCancelledError,
  BiometricUnavailableError,
  disableBiometric,
  enrollBiometric,
  getBiometricCapability,
  isBiometricEnabled,
  subscribeBiometricChanged,
  type BiometricCapability,
} from "@/lib/auth/biometric";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";
import { FingerprintMark } from "./FingerprintMark";

export function BiometricControl() {
  const a = at(useLocale().locale).account;
  const [cap, setCap] = useState<BiometricCapability | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    const sync = () => setEnabled(isBiometricEnabled());
    sync();
    const unsub = subscribeBiometricChanged(sync);
    void getBiometricCapability().then(setCap);
    return unsub;
  }, []);

  async function enable() {
    setBusy(true);
    setFlash("");
    try {
      const res = await fetch("/api/auth/biometric-token");
      if (!res.ok) {
        setFlash(a.biometricNeedLogin);
        return;
      }
      const data = (await res.json()) as {
        token: string;
        user: { id: string; email: string };
      };
      await enrollBiometric({
        userId: data.user.id,
        email: data.user.email,
        token: data.token,
        reason: a.biometricTitle,
      });
      setEnabled(true);
      setFlash(a.biometricEnabled);
    } catch (err) {
      if (err instanceof BiometricCancelledError) {
        /* closed the system prompt */
      } else if (err instanceof BiometricUnavailableError) {
        setFlash(a.biometricUnavailable);
      } else {
        setFlash(a.biometricFailed);
      }
    } finally {
      setBusy(false);
    }
  }

  function disable() {
    disableBiometric();
    setEnabled(false);
    setFlash(a.biometricDisabled);
  }

  const available = cap?.available === true;

  return (
    <section className="rounded-2xl border border-gold/20 bg-sand/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gold">
            {a.biometricTitle}
          </h2>
          <p className="mt-1 text-xs text-sand/50">{a.biometricHint}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
          <FingerprintMark size={22} />
        </span>
      </div>

      {cap && !available ? (
        <p className="mt-4 text-xs text-sand/55">{a.biometricUnavailable}</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/15 px-4 py-3">
            <span className="text-sm">
              {enabled ? a.biometricOn : a.biometricOff}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={busy || cap === null}
              onClick={() => (enabled ? disable() : void enable())}
              className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-50 ${
                enabled ? "bg-gold" : "bg-sand/20"
              }`}
              aria-label={a.biometricTitle}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-night transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-sand/50">
            {flash || (enabled ? a.biometricEnabled : a.biometricEnableHint)}
          </p>
        </>
      )}
    </section>
  );
}
