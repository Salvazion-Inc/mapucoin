"use client";

import { useEffect, useState } from "react";
import { PREMIUM_COPY_ES as c } from "@/lib/salvazion-premium-copy";

const REASONS: Record<string, string> = {
  invalid_wallet: c.invalid,
  not_holder: c.notHolder,
  unconfigured: c.unconfigured,
  rpc_error: c.rpcError,
  rate: c.rate,
};

export function PremiumKeyPanel() {
  const [premium, setPremium] = useState(false);
  const [wallet, setWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/premium")
      .then((res) => res.json())
      .then((data: { enabled?: boolean; premium?: boolean }) => {
        if (!live || !data.enabled) return;
        setPremium(Boolean(data.premium));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        enabled?: boolean;
        premium?: boolean;
        reason?: string;
      };
      if (!data.enabled) {
        setPremium(false);
        return;
      }
      setPremium(Boolean(data.premium));
      setWallet("");
      if (!data.premium) setMessage(REASONS[data.reason || ""] || c.rpcError);
    } catch {
      setMessage(c.rpcError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-gold/20 p-4">
      <h2 className="font-display text-xl">{c.title}</h2>
      <p className="mt-2 text-sm text-sand/70">{c.lead}</p>
      <p className="mt-2 text-sm text-sand/80">{c.disclaimer}</p>
      {premium ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gold">{c.active}</p>
          <p className="mt-1 text-sm text-sand/80">{c.benefit}</p>
          <p className="mt-2 text-sm text-sand/70">{c.note}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            {c.walletLabel}
            <input
              className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
              aria-describedby="premium-key-hint"
              required
            />
          </label>
          <p id="premium-key-hint" className="text-xs text-sand/50">
            {c.walletHint}
          </p>
          {message ? <p className="text-sm text-clay">{message}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="btn-gold w-full !py-3 disabled:opacity-60"
          >
            {busy ? c.checking : c.submit}
          </button>
        </form>
      )}
    </section>
  );
}
