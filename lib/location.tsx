"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_HERE, type LatLng } from "./geo";

type Here = LatLng & { label: string };

type Ctx = {
  here: Here;
  located: boolean;
  locating: boolean;
  denied: boolean;
  locate: () => void;
};

const LocationCtx = createContext<Ctx | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [here, setHere] = useState<Here>(DEFAULT_HERE);
  const [located, setLocated] = useState(false);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "GPS",
        });
        setLocated(true);
        setDenied(false);
        setLocating(false);
      },
      () => {
        setDenied(true);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const value = useMemo(
    () => ({ here, located, locating, denied, locate }),
    [here, located, locating, denied, locate],
  );

  return (
    <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationCtx);
  if (!ctx) {
    return {
      here: DEFAULT_HERE,
      located: false,
      locating: false,
      denied: false,
      locate: () => {},
    };
  }
  return ctx;
}
