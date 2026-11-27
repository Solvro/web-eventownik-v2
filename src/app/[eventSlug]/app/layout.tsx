import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { cache } from "react";

import { MobileDesktopFrame } from "@/components/mobile/desktop-frame";
import { MobileInstallPrompt } from "@/components/mobile/install-prompt";
import { MobileProvider } from "@/components/mobile/mobile-context";
import { getMobilePublicConfig } from "@/lib/mobile/session";
import { mobileAccent, mobileThemeStyle } from "@/lib/mobile/theme";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

interface MobileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ eventSlug: string }>;
}

const loadConfig = cache(getMobilePublicConfig);

export async function generateMetadata({
  params,
}: Pick<MobileLayoutProps, "params">): Promise<Metadata> {
  const { eventSlug } = await params;
  const config = await loadConfig(eventSlug).catch(() => null);
  const name = config?.event.name ?? "Eventownik";
  return {
    title: { absolute: name },
    description: undefined,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
    manifest: `/${eventSlug}/app/manifest.webmanifest`,
    alternates: { canonical: null },
    appleWebApp: {
      capable: true,
      title: name,
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: "/assets/mobile/icon-192.png",
    },
  };
}

export async function generateViewport({
  params,
}: Pick<MobileLayoutProps, "params">): Promise<Viewport> {
  const { eventSlug } = await params;
  const config = await loadConfig(eventSlug).catch(() => null);
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: mobileAccent(
      config?.app.accentColor ?? config?.event.primaryColor,
    ),
  };
}

export default async function MobileAppLayout({
  children,
  params,
}: MobileLayoutProps) {
  const { eventSlug } = await params;
  const config = await loadConfig(eventSlug);
  if (config === null) {
    notFound();
  }

  return (
    <div
      className={cn(
        montserrat.className,
        "min-h-dvh bg-white tracking-[-0.01em] text-[#121212] antialiased scheme-light",
      )}
      style={mobileThemeStyle(
        config.app.accentColor ?? config.event.primaryColor,
      )}
    >
      <MobileProvider eventSlug={eventSlug} config={config}>
        <MobileDesktopFrame>
          {/* Hidden on desktop until the phone frame takes over, to avoid a flash of the bare app */}
          <div className="relative mx-auto min-h-dvh w-full max-w-md overflow-x-clip bg-white sm:border-x sm:border-[#E7E7E7] [@media(min-width:768px)_and_(hover:hover)_and_(pointer:fine)]:invisible">
            {children}
            <MobileInstallPrompt />
          </div>
        </MobileDesktopFrame>
      </MobileProvider>
    </div>
  );
}
