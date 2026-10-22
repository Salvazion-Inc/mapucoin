"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BiometricCancelledError,
  disableBiometric,
  persistBiometricVault,
  unlockWithBiometric,
} from "@/lib/auth/biometric";
import { at } from "@/lib/app-copy";
import type { Locale } from "@/lib/locale";
import { BiometricUnlockScreen } from "./BiometricUnlockScreen";
import { useAutoBiometricPrompt, useBiometricGate } from "./useBiometric";

export function BiometricLogin({
  locale,
  next,
  onUsePassword,
}: {
  locale: Locale;
  next: string;
  onUsePassword: () => void;
}) {
  const c = at(locale);
  const router = useRouter();
  const { email } = useBiometricGate();
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  async function handleUnlock() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const vault = await unlockWithBiometric();
      const res = await fetch("/api/auth/biometric-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: vault.token }),
      });
      if (!res.ok) {
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          // Stored token rejected server-side: the vault can never work again.
          // Drop it and send the user to email/password instead of looping.
          disableBiometric();
          setError(c.biometricExpired);
          onUsePassword();
          return;
        }
        // Transient/server error: keep the vault so a retry can succeed.
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

  useAutoBiometricPrompt({ active: true, run: handleUnlock });

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
          onClick={onUsePassword}
          disabled={loading}
          className="text-xs text-sand/55 transition hover:text-gold"
        >
          {c.biometricUsePassword}
        </button>
      }
    />
  );
}
