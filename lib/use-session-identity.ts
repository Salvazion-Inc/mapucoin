"use client";

import { useEffect, useState } from "react";

export function useSessionIdentity() {
  const [identity, setIdentity] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    let cancel = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: { name?: string; email?: string } | null }) => {
        if (cancel || !data.user) return;
        setIdentity({
          name: String(data.user.name || ""),
          email: String(data.user.email || ""),
        });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  return identity;
}
