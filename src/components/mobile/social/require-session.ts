import { redirect } from "next/navigation";

import { getMobileMe } from "@/lib/mobile/session";

/**
 * Server-side gate for full-screen participant pages outside the (tabs) group:
 * sends visitors without a session to login and those without a profile to
 * onboarding, like the (tabs) layout does.
 */
export async function requireMobileSession(eventSlug: string) {
  const base = `/${encodeURIComponent(eventSlug)}/app`;
  const result = await getMobileMe(eventSlug);
  if (result.status === "unauthenticated") {
    redirect(`${base}/login`);
  }
  if (result.status === "ok" && result.me.profile === null) {
    redirect(`${base}/onboarding`);
  }
}
