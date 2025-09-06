"use client";

import { useEffect } from "react";

import { initializeWebVitals } from "@/lib/web-vitals";

export function WebVitalsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  useEffect(() => {
    const disabled = process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "false";
    if (!disabled) {
      initializeWebVitals();
    }
  }, []);
  return children;
}
