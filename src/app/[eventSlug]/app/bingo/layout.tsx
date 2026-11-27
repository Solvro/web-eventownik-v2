import type { ReactNode } from "react";

import { requireMobileSession } from "@/components/mobile/social/require-session";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  await requireMobileSession(eventSlug);
  return children;
}
