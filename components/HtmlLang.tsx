"use client";

import { localeMeta } from "@/lib/locale";
import { useLocale } from "@/lib/locale-context";
import { useEffect } from "react";

export default function HtmlLang() {
  const { locale } = useLocale();
  useEffect(() => {
    document.documentElement.lang = localeMeta[locale].htmlLang;
    document.documentElement.dataset.locale = locale;
  }, [locale]);
  return null;
}
