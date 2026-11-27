"use client";

import {
  CalendarDays,
  House,
  LifeBuoy,
  MessageCircle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEventSlug } from "@/components/mobile/use-event-slug";
import { cn } from "@/lib/utils";

export function MobileTabBar({
  schedule,
  chat,
  sos,
}: {
  schedule: boolean;
  chat: boolean;
  sos: boolean;
}) {
  const eventSlug = useEventSlug();
  const pathname = usePathname();
  const base = `/${eventSlug}/app`;
  const tabs = [
    { href: `${base}/sos`, label: "SOS", icon: LifeBuoy, enabled: sos },
    {
      href: `${base}/schedule`,
      label: "Harmonogram",
      icon: CalendarDays,
      enabled: schedule,
    },
    { href: base, label: "Wydarzenie", icon: House, enabled: true },
    {
      href: `${base}/chats`,
      label: "Czaty",
      icon: MessageCircle,
      enabled: chat,
    },
    {
      href: `${base}/profile`,
      label: "Profil",
      icon: UserRound,
      enabled: true,
    },
  ].filter((tab) => tab.enabled);

  return (
    <nav
      aria-label="Nawigacja"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-[#E7E7E7] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-[72px] items-stretch px-2">
        {tabs.map((tab) => {
          const home = tab.href === base;
          const active = home
            ? pathname === base
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          if (home) {
            return (
              <li key={tab.href} className="flex flex-1 justify-center">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-2 text-[10px] leading-none font-semibold tracking-normal text-[#2F2F2F]"
                >
                  <span
                    className={cn(
                      "-mt-[19px] flex size-[60px] items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)] ring-4 ring-white transition active:scale-95",
                      !active && "opacity-90",
                    )}
                  >
                    <Icon className="size-7" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className={cn(active ? "text-black" : "opacity-70")}>
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          }
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-[10px] leading-none font-semibold tracking-normal transition-colors",
                  active ? "text-black" : "text-[#2F2F2F]/60",
                )}
              >
                <Icon
                  className="size-6"
                  strokeWidth={active ? 2.2 : 1.6}
                  aria-hidden
                />
                {tab.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-1.5 size-1 rounded-full bg-[var(--mobile-accent)] transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
