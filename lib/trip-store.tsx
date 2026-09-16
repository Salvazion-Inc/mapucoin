"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { TravelPlan } from "@/components/ItineraryView";

export type TripDraft = {
  lugar: string;
  presupuesto: number;
  noches: number;
  viajeros: number;
  intereses: string[];
  plan: TravelPlan | null;
  bookingId?: string;
  paymentStatus: "unpaid" | "paid";
};

const KEY = "mapucoin-trip-v1";

const empty: TripDraft = {
  lugar: "san-pedro-de-atacama",
  presupuesto: 800000,
  noches: 4,
  viajeros: 2,
  intereses: ["naturaleza", "gastronomia"],
  plan: null,
  paymentStatus: "unpaid",
};

type Ctx = {
  trip: TripDraft;
  setTrip: (patch: Partial<TripDraft>) => void;
  reset: () => void;
  ready: boolean;
};

const TripCtx = createContext<Ctx | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setState] = useState<TripDraft>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<TripDraft>;
        setState({ ...empty, ...data });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(trip));
    } catch {
      /* quota */
    }
  }, [trip, ready]);

  const setTrip = useCallback((patch: Partial<TripDraft>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setState(empty), []);

  const value = useMemo(
    () => ({ trip, setTrip, reset, ready }),
    [trip, setTrip, reset, ready],
  );

  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripCtx);
  if (!ctx) {
    return {
      trip: empty,
      setTrip: () => {},
      reset: () => {},
      ready: true,
    };
  }
  return ctx;
}
