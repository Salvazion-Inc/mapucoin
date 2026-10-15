export function safeNextPath(value: string | null | undefined, fallback = "/app") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  if (value.includes("://")) return fallback;
  return value;
}

export function herePath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function redirectForStatus(status: number, error: unknown, next: string) {
  const code = typeof error === "string" ? error : "";
  let path: string | null = null;
  if (status === 401 || code === "auth") {
    path = `/login?next=${encodeURIComponent(next)}`;
  } else if (status === 403 && code === "email_unverified") {
    path = `/verificar?next=${encodeURIComponent(next)}`;
  }
  if (!path || typeof window === "undefined") return false;
  window.location.assign(path);
  return true;
}

export async function redirectUnlessVerified(next: string) {
  const res = await fetch("/api/auth/me").catch(() => null);
  if (!res) return false;
  const data = (await res.json().catch(() => ({}))) as {
    user?: { emailVerified?: boolean } | null;
  };
  const user = data.user;
  if (!user) {
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    return true;
  }
  if (!user.emailVerified) {
    window.location.assign(`/verificar?next=${encodeURIComponent(next)}`);
    return true;
  }
  return false;
}
