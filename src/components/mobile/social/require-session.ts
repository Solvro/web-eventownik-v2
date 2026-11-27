import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Server-side gate for full-screen participant pages outside the (tabs) group. */
export async function requireMobileSession(eventSlug: string) {
  const cookieStore = await cookies();
  if (cookieStore.get(`mobile-session-${eventSlug}`) === undefined) {
    redirect(`/${encodeURIComponent(eventSlug)}/app/login`);
  }
}
