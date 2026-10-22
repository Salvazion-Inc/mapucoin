"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BiometricCancelledError,
  disableBiometric,
  persistBiometricVault,
  unlockWithBiometric,
} from "@/lib/auth/biometric";
import {
  recoverDeadBiometricLogin,
  resolveBiometricUnlock,
  type BiometricUnlockSignal,
} from "@/lib/auth/biometric-session";
import { at } from "@/lib/app-copy";
import type { Locale } from "@/lib/locale";
import { BiometricUnlockScreen } from "./BiometricUnlockScreen";
import { useAutoBiometricPrompt, useBiometricGate } from "./useBiometric";

async function signOutLocal() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export function BiometricLogin({
  locale,
  next,
  onUsePassword,
}: {
  locale: Locale;
  next: string;
  onUsePassword: (notice?: string) => void;
}) {
  const c = at(locale);
  const router = useRouter();
  const { email } = useBiometricGate();
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const [stopped, setStopped] = useState(false);
  const loadingRef = useRef(false);
  const droppedRef = useRef(false);

  async function fallBackToPassword() {
    if (droppedRef.current) return;
    droppedRef.current = true;
    setStopped(true);
    await recoverDeadBiometricLogin({
      disableBiometric,
      signOutLocal,
      showPasswordLogin: () => onUsePassword(c.biometricExpired),
    });
  }

  async function handleUnlock() {
    if (loadingRef.current || droppedRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const vault = await unlockWithBiometric();
      let res: Response;
      try {
        res = await fetch("/api/auth/biometric-unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: vault.token }),
        });
      } catch (err) {
        const name = err instanceof Error ? err.name : undefined;
        const message = err instanceof Error ? err.message : String(err);
        if (resolveBiometricUnlock({ ok: false, name, message }) === "fallback") {
          await fallBackToPassword();
          return;
        }
        setError(c.biometricFailed);
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: unknown;
          message?: unknown;
          code?: unknown;
        };
        const signal: BiometricUnlockSignal = {
          ok: false,
          status: res.status,
          error: typeof data.error === "string" ? data.error : undefined,
          message: typeof data.message === "string" ? data.message : undefined,
          code: typeof data.code === "string" ? data.code : undefined,
        };
        if (resolveBiometricUnlock(signal) === "fallback") {
          await fallBackToPassword();
          return;
        }
        setError(c.biometricFailed);
        return;
      }

      const data = (await res.json()) as {
        token?: string;
        user?: { email?: string };
      };
      persistBiometricVault(data.token || vault.token, data.user?.email || vault.email);
      router.replace(next.startsWith("/") ? next : "/app");
      router.refresh();
    } catch (err) {
      if (!(err instanceof BiometricCancelledError)) {
        setError(c.biometricFailed);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setAttempted(true);
    }
  }

  useAutoBiometricPrompt({ active: !stopped, run: handleUnlock });

  const status =
    loading || !attempted ? c.biometricProcessing : c.biometricRetry;

  return (
    <BiometricUnlockScreen
      title={c.biometricLockTitle}
      subtitle={c.biometricLockSubtitle}
      status={status}
      email={email}
      busy={loading}
      error={error || null}
      promptLabel={c.biometricEnter}
      onPrompt={() => void handleUnlock()}
      footer={
        <button
          type="button"
          onClick={() => onUsePassword()}
          disabled={loading}
          className="text-xs text-sand/55 transition hover:text-gold"
        >
          {c.biometricUsePassword}
        </button>
      }
    />
  );
}
