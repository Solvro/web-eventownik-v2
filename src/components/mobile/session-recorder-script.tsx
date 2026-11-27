"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const MOBILE_APP_PATH = /^\/[^/]+\/app(\/|$)/;

/**
 * Session-replay recorder. Never loaded inside the participant app, where people
 * type login codes and private chat messages.
 */
export function SessionRecorderScript({ websiteId }: { websiteId: string }) {
  const pathname = usePathname();
  if (MOBILE_APP_PATH.test(pathname)) {
    return null;
  }
  return (
    <Script
      defer
      src="https://analytics.solvro.pl/recorder.js"
      strategy="afterInteractive"
      data-website-id={websiteId}
    />
  );
}
