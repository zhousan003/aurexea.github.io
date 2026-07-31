"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/site-data";

export function AnalyticsTracker({ locale }: { locale: Locale }) {
  useEffect(() => {
    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: window.location.pathname,
        locale,
        referrer: document.referrer,
      }),
    });
  }, [locale]);

  return null;
}
