import { redirect } from "next/navigation";

import { MobileTabBar } from "@/components/mobile/tab-bar";
import { getMobileMe, getMobilePublicConfig } from "@/lib/mobile/session";

export default async function MobileTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const result = await getMobileMe(eventSlug);
  if (result.status !== "ok") {
    redirect(`/${eventSlug}/app/login`);
  }
  if (result.me.profile === null) {
    redirect(`/${eventSlug}/app/onboarding`);
  }
  const config = await getMobilePublicConfig(eventSlug).catch(() => null);
  const features = config?.app.features;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
        {children}
      </div>
      <MobileTabBar
        schedule={features?.schedule ?? true}
        chat={features?.chat ?? true}
        sos={features?.sos ?? true}
      />
    </div>
  );
}
