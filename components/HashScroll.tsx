"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

export default function HashScroll() {
  const path = usePathname();

  useEffect(() => {
    const t = window.setTimeout(scrollToHash, 80);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [path]);

  return null;
}
