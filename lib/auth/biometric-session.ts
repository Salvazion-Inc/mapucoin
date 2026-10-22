/**
 * What to do when fingerprint unlock cannot restore the session stored on
 * the device. Auth rejections (dead refresh token, expired session, user
 * gone) must drop the vault. Transport failures must not: the next try can
 * still succeed, and wiping the vault would force a password login for a blip.
 */

export type BiometricUnlockSignal = {
  ok: boolean;
  status?: number;
  name?: string;
  code?: string;
  message?: string;
  error?: string;
};

export type BiometricUnlockAction = "continue" | "retry" | "fallback";

const DEAD_SESSION_ERRORS = new Set([
  "expired",
  "invalid_grant",
  "refresh_token_not_found",
  "session_not_found",
  "user_not_found",
  "user not found",
]);

/** True only for auth rejections, never for network or other transient errors. */
export function isDeadStoredSession(signal: BiometricUnlockSignal): boolean {
  if (signal.ok) return false;
  if (signal.name === "AuthRetryableFetchError") return false;
  if (signal.status === 400 || signal.status === 401 || signal.status === 403) {
    return true;
  }
  if (signal.name === "AuthApiError" || signal.name === "AuthSessionMissingError") {
    return true;
  }
  const tokenError = `${signal.error ?? ""}`.trim().toLowerCase();
  if (DEAD_SESSION_ERRORS.has(tokenError)) return true;
  const blob = `${signal.code ?? ""} ${signal.message ?? ""} ${signal.error ?? ""}`.toLowerCase();
  return (
    blob.includes("refresh_token") ||
    blob.includes("refresh token") ||
    blob.includes("invalid") ||
    blob.includes("session_not_found") ||
    blob.includes("jwt expired") ||
    blob.includes("user not found") ||
    blob.includes("user_not_found")
  );
}

export function resolveBiometricUnlock(signal: BiometricUnlockSignal): BiometricUnlockAction {
  if (signal.ok) return "continue";
  return isDeadStoredSession(signal) ? "fallback" : "retry";
}

/**
 * Server rejected the stored session. Sign out locally, clear the biometric
 * binding, and leave the fingerprint screen. `promptAgain` is always false so
 * the sensor is not opened another time with the same dead vault.
 */
export async function recoverDeadBiometricLogin(actions: {
  disableBiometric: () => void;
  signOutLocal: () => Promise<void>;
  showPasswordLogin: () => void;
}): Promise<{ promptAgain: false }> {
  actions.disableBiometric();
  try {
    await actions.signOutLocal();
  } catch {
    /* The vault is already gone. Still leave the fingerprint screen. */
  }
  actions.showPasswordLogin();
  return { promptAgain: false };
}
