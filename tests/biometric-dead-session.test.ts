import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { POST as unlockPost } from "../app/api/auth/biometric-unlock/route.ts";
import {
  BIOMETRIC_STATE_KEY,
  BIOMETRIC_VAULT_KEY,
  disableBiometric,
  getBiometricVault,
  isBiometricEnabled,
  persistBiometricVault,
  type BiometricState,
} from "../lib/auth/biometric.ts";
import {
  recoverDeadBiometricLogin,
  resolveBiometricUnlock,
} from "../lib/auth/biometric-session.ts";
import { createSessionToken, type SessionUser } from "../lib/session.ts";

const owner: SessionUser = {
  id: "user-dead-session",
  email: "info@salvazion.org",
  name: "Owner",
  emailVerified: true,
};

type MemoryStorage = Storage & { memory: Map<string, string> };

function installDom() {
  const memory = new Map<string, string>();
  const localStorage = {
    memory,
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  } as MemoryStorage;
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      dispatchEvent() {
        return true;
      },
      addEventListener() {},
      removeEventListener() {},
      location: { hostname: "localhost" },
    },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: localStorage,
  });
  return () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: previousStorage,
    });
  };
}

function enroll(token = "stored-refresh-token") {
  const state: BiometricState = {
    enabled: true,
    email: owner.email,
    userId: owner.id,
    credentialId: "cred",
    enrolledAt: 1,
  };
  localStorage.setItem(BIOMETRIC_STATE_KEY, JSON.stringify(state));
  persistBiometricVault(token, owner.email);
}

describe("dead biometric session (DEC-20261022-04)", () => {
  let restore: (() => void) | null = null;

  afterEach(() => {
    restore?.();
    restore = null;
  });

  it("classifies auth rejection as a dead session and keeps the vault on network errors", () => {
    assert.equal(resolveBiometricUnlock({ ok: true }), "continue");
    assert.equal(
      resolveBiometricUnlock({ ok: false, status: 401, error: "expired" }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({ ok: false, status: 401, error: "user_not_found" }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        name: "AuthApiError",
        message: "User not found",
      }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        status: 400,
        code: "refresh_token_not_found",
        message: "Invalid Refresh Token: Refresh Token Not Found",
      }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        name: "AuthSessionMissingError",
        message: "Auth session missing",
      }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({ ok: false, message: "session_not_found" }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({ ok: false, message: "jwt expired" }),
      "fallback",
    );
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        name: "AuthRetryableFetchError",
        message: "Failed to fetch",
        status: 0,
      }),
      "retry",
    );
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        name: "TypeError",
        message: "Failed to fetch",
      }),
      "retry",
    );
    assert.equal(resolveBiometricUnlock({ ok: false, status: 500 }), "retry");
    assert.equal(resolveBiometricUnlock({ ok: false, status: 502, error: "unavailable" }), "retry");
  });

  it("signs out, clears the stored session and binding, and does not prompt again", async () => {
    restore = installDom();
    enroll();
    assert.equal(isBiometricEnabled(), true);
    assert.equal(getBiometricVault()?.token, "stored-refresh-token");

    let signedOut = 0;
    let passwordShown = 0;
    let prompts = 0;
    let screen: "fingerprint" | "password" = "fingerprint";

    async function autoPrompt() {
      if (!isBiometricEnabled() || screen !== "fingerprint") return;
      prompts += 1;
      const action = resolveBiometricUnlock({
        ok: false,
        status: 401,
        error: "expired",
      });
      assert.equal(action, "fallback");
      const recovered = await recoverDeadBiometricLogin({
        disableBiometric,
        signOutLocal: async () => {
          signedOut += 1;
        },
        showPasswordLogin: () => {
          passwordShown += 1;
          screen = "password";
        },
      });
      assert.equal(recovered.promptAgain, false);
    }

    await autoPrompt();
    await autoPrompt();

    assert.equal(prompts, 1);
    assert.equal(signedOut, 1);
    assert.equal(passwordShown, 1);
    assert.equal(screen, "password");
    assert.equal(isBiometricEnabled(), false);
    assert.equal(getBiometricVault(), null);
    assert.equal(localStorage.getItem(BIOMETRIC_STATE_KEY), null);
    assert.equal(localStorage.getItem(BIOMETRIC_VAULT_KEY), null);
  });

  it("still falls back to password when local sign-out fails", async () => {
    restore = installDom();
    enroll("revoked-token");
    let screen: "fingerprint" | "password" = "fingerprint";
    const recovered = await recoverDeadBiometricLogin({
      disableBiometric,
      signOutLocal: async () => {
        throw new Error("offline");
      },
      showPasswordLogin: () => {
        screen = "password";
      },
    });
    assert.equal(recovered.promptAgain, false);
    assert.equal(screen, "password");
    assert.equal(isBiometricEnabled(), false);
    assert.equal(getBiometricVault(), null);
  });

  it("leaves the vault in place when the failure is not an auth rejection", () => {
    restore = installDom();
    enroll("still-good");
    assert.equal(
      resolveBiometricUnlock({ ok: false, name: "TypeError", message: "Failed to fetch" }),
      "retry",
    );
    assert.equal(isBiometricEnabled(), true);
    assert.equal(getBiometricVault()?.token, "still-good");
  });

  it("treats a server rejection of the stored token as a dead session", async () => {
    const rejected = await unlockPost(
      new Request("http://localhost/api/auth/biometric-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "not-a-session" }),
      }),
    );
    assert.equal(rejected.status, 401);
    const rejectedBody = (await rejected.json()) as { error?: string };
    assert.equal(rejectedBody.error, "expired");
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        status: rejected.status,
        error: rejectedBody.error,
      }),
      "fallback",
    );

    const missingUser = await unlockPost(
      new Request("http://localhost/api/auth/biometric-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "" }),
      }),
    );
    assert.equal(missingUser.status, 401);
    const missingBody = (await missingUser.json()) as { error?: string };
    assert.equal(missingBody.error, "expired");
    assert.equal(
      resolveBiometricUnlock({
        ok: false,
        status: missingUser.status,
        error: "user_not_found",
      }),
      "fallback",
    );

    const token = await createSessionToken(owner);
    const accepted = await unlockPost(
      new Request("http://localhost/api/auth/biometric-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }),
    );
    assert.equal(accepted.status, 200);
    const acceptedBody = (await accepted.json()) as { token?: string; user?: { email?: string } };
    assert.equal(acceptedBody.user?.email, owner.email);
    assert.equal(typeof acceptedBody.token, "string");
    assert.equal(resolveBiometricUnlock({ ok: true }), "continue");
  });

  it("wires the login screen to clear the vault instead of re-prompting", () => {
    const login = readFileSync("components/auth/BiometricLogin.tsx", "utf8");
    const form = readFileSync("components/AuthForm.tsx", "utf8");
    assert.match(login, /resolveBiometricUnlock/);
    assert.match(login, /recoverDeadBiometricLogin/);
    assert.match(login, /disableBiometric/);
    assert.match(login, /\/api\/auth\/logout/);
    assert.match(login, /active: !stopped/);
    assert.match(login, /droppedRef\.current/);
    assert.doesNotMatch(login, /setError\(c\.biometricExpired\)/);
    assert.match(form, /setPasswordFallback\(true\)/);
    assert.match(form, /if \(notice\) setMessage\(notice\)/);
  });
});
