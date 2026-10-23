import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { POST as loginPost } from "../app/api/auth/login/route.ts";
import { POST as logoutPost } from "../app/api/auth/logout/route.ts";
import { hashPassword } from "../lib/passwords.ts";
import {
  createRecoveryToken,
  readRecoveryToken,
} from "../lib/password-recovery.ts";
import { middleware } from "../middleware.ts";
import {
  AuthSecretError,
  createSessionToken,
  readSession,
  resolveAuthSecret,
  signAccounts,
  ACCOUNTS_COOKIE,
} from "../lib/session.ts";

const OLD_FALLBACK = "mapucoin-by-salvazion-inc-session-key";

function restoreEnv(prev: {
  secret: string | undefined;
  vercel: string | undefined;
}) {
  if (prev.secret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = prev.secret;
  if (prev.vercel === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = prev.vercel;
}

function snapshotEnv() {
  return {
    secret: process.env.AUTH_SECRET,
    vercel: process.env.VERCEL_ENV,
  };
}

function bytesToB64Url(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signWith(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return `${bytesToB64Url(new TextEncoder().encode(value))}.${bytesToB64Url(new Uint8Array(sig))}`;
}

describe("session secret and logout (DEC-20261021-02)", () => {
  it("fails closed in production when AUTH_SECRET is missing", async () => {
    const prev = snapshotEnv();
    delete process.env.VERCEL_ENV;
    const vault = await signAccounts([
      {
        id: "user-prod",
        email: "ana@mapucoin.test",
        name: "Ana",
        hash: hashPassword("password12"),
      },
    ]);
    delete process.env.AUTH_SECRET;
    process.env.VERCEL_ENV = "production";
    try {
      assert.throws(() => resolveAuthSecret(), AuthSecretError);
      await assert.rejects(
        () =>
          createSessionToken({
            id: "user-prod",
            email: "ana@mapucoin.test",
            name: "Ana",
            emailVerified: true,
          }),
        AuthSecretError,
      );
      const sample = await signWith("local-test-key", "hello");
      await assert.rejects(() => readSession(sample), AuthSecretError);

      const open = await middleware(new NextRequest("https://mapucoin.com/"));
      assert.notEqual(open.status, 500);

      const closed = await middleware(
        new NextRequest("https://mapucoin.com/app", {
          headers: { cookie: `mapucoin_session=${sample}` },
        }),
      );
      assert.equal(closed.status, 500);
      assert.equal((await closed.json()).error, "server");

      const login = await loginPost(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: `${ACCOUNTS_COOKIE}=${vault}`,
          },
          body: JSON.stringify({ email: "ana@mapucoin.test", password: "password12" }),
        }),
      );
      assert.equal(login.status, 500);
      assert.equal((await login.json()).error, "server");
      assert.equal(
        login.headers.getSetCookie().some((line) => line.startsWith("mapucoin_session=")),
        false,
      );
    } finally {
      restoreEnv(prev);
    }
  });

  it("keeps a dev-only fallback outside production and rejects the removed key", async () => {
    const sessionSource = readFileSync("lib/session.ts", "utf8");
    const recoverySource = readFileSync("lib/password-recovery.ts", "utf8");
    assert.equal(sessionSource.includes(OLD_FALLBACK), false);
    assert.equal(recoverySource.includes(OLD_FALLBACK), false);
    assert.match(sessionSource, /resolveAuthSecret/);
    assert.match(sessionSource, /VERCEL_ENV === "production"/);

    const prev = snapshotEnv();
    delete process.env.AUTH_SECRET;
    delete process.env.VERCEL_ENV;
    try {
      assert.equal(resolveAuthSecret(), "mapucoin-dev-only-auth-secret");
      const token = await createSessionToken({
        id: "user-dev",
        email: "ana@mapucoin.test",
        name: "Ana",
        emailVerified: true,
      });
      assert.equal((await readSession(token))?.email, "ana@mapucoin.test");
      const forged = await signWith(
        OLD_FALLBACK,
        JSON.stringify({
          id: "user-dev",
          email: "ana@mapucoin.test",
          name: "Ana",
          emailVerified: true,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      );
      assert.equal(await readSession(forged), null);
    } finally {
      restoreEnv(prev);
    }
  });

  it("derives the recovery AES key with HKDF instead of SHA-256", async () => {
    const source = readFileSync("lib/password-recovery.ts", "utf8");
    assert.match(source, /name: "HKDF"/);
    assert.match(source, /mapucoin-password-recovery-aes-v1/);
    assert.equal(source.includes("mapucoin-recovery:${"), false);

    const prev = snapshotEnv();
    delete process.env.AUTH_SECRET;
    delete process.env.VERCEL_ENV;
    try {
      const token = await createRecoveryToken({
        email: "ana@mapucoin.test",
        userId: "user-hkdf",
        tokenHash: "hash-user-hkdf",
        jti: "jti-hkdf",
      });
      assert.equal((await readRecoveryToken(token))?.userId, "user-hkdf");

      const secret = resolveAuthSecret();
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(`mapucoin-recovery:${secret}`),
      );
      const shaKey = await crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["decrypt"]);
      const parts = token.split(".");
      const iv = Buffer.from(parts[2], "base64url");
      const ciphertext = Buffer.from(parts[3], "base64url");
      await assert.rejects(() =>
        crypto.subtle.decrypt({ name: "AES-GCM", iv }, shaKey, ciphertext),
      );
    } finally {
      restoreEnv(prev);
    }
  });

  it("checks Origin and Referer on POST logout", async () => {
    const cookie = "mapucoin_session=abc.def";
    const foreign = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: { cookie, origin: "https://evil.example" },
      }),
    );
    assert.equal(foreign.status, 403);
    assert.equal((await foreign.json()).error, "origin");
    assert.equal(foreign.headers.getSetCookie().length, 0);

    const badReferer = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: { cookie, referer: "https://evil.example/csrf" },
      }),
    );
    assert.equal(badReferer.status, 403);
    assert.equal(badReferer.headers.getSetCookie().length, 0);

    const neither = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: { cookie },
      }),
    );
    assert.equal(neither.status, 403);

    const fromOrigin = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: { cookie, origin: "https://mapucoin.com" },
      }),
    );
    assert.equal(fromOrigin.status, 200);
    assert.ok(
      fromOrigin.headers.getSetCookie().some((line) => line.startsWith("mapucoin_session=") && /Max-Age=0/.test(line)),
    );

    const fromReferer = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: { cookie, referer: "https://www.mapucoin.com/app" },
      }),
    );
    assert.equal(fromReferer.status, 200);

    const originWins = await logoutPost(
      new Request("https://mapucoin.com/api/auth/logout", {
        method: "POST",
        headers: {
          cookie,
          origin: "https://evil.example",
          referer: "https://mapucoin.com/app",
        },
      }),
    );
    assert.equal(originWins.status, 403);
  });
});
