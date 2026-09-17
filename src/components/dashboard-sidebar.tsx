"use client";

import {
  ClipboardPenLine,
  Cuboid,
  Mail,
  Play,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Attribute } from "@/types/attributes";
import type { Event } from "@/types/event";

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

interface SidebarLink {
  title: string;
  icon: ReactNode;
  route: string;
}

const SIDEBAR_STORAGE_KEY = "eventownik-dashboard-sidebar-open";

function readSidebarState(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function writeSidebarState(isOpen: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
  } catch {}
}

const DashboardSidebarContext = createContext<{
  isSideBarOpen: boolean;
  toggleSideBar: () => void;
} | null>(null);

export function DashboardSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setIsSideBarOpen(readSidebarState());
  }, []);

  return (
    <DashboardSidebarContext.Provider
      value={{
        isSideBarOpen,
        toggleSideBar: () => {
          setIsSideBarOpen((isOpen) => {
            const nextIsOpen = !isOpen;
            writeSidebarState(nextIsOpen);
            return nextIsOpen;
          });
        },
      }}
    >
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  const context = useContext(DashboardSidebarContext);

  if (context === null) {
    throw new Error(
      "useDashboardSidebar must be used within DashboardSidebarProvider",
    );
  }

  return context;
}

export function DashboardSidebar({
  event,
  attributes,
}: {
  event: Event;
  attributes: Attribute[];
}) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const { isSideBarOpen } = useDashboardSidebar();

  const blocks = attributes
    .filter(({ type }) => type === "block")
    .map(
      (block) =>
        ({
          title: block.name,
          icon: <Cuboid />,
          route: `blocks/${block.id.toString()}`,
        }) as SidebarLink,
    );

  const sections: SidebarSection[] = [
    {
      title: t("general"),
      links: [
        {
          title: t("event"),
          icon: <Play />,
          route: event.id.toString(),
        },
        {
          title: t("forms"),
          icon: <ClipboardPenLine />,
          route: "forms",
        },
        {
          title: t("settings"),
          icon: <SlidersHorizontal />,
          route: "settings",
        },
      ],
    },
    {
      title: t("participants"),
      links: [
        {
          title: t("listOfParticipants"),
          icon: <Users />,
          route: "participants",
        },
      ],
    },
    {
      title: t("emails"),
      links: [
        {
          title: t("emailTemplates"),
          icon: <Mail />,
          route: "emails",
        },
      ],
    },
  ];

  function isActiveLink(linkRoute: string) {
    return (
      pathname.endsWith(`events/${linkRoute}`) ||
      (linkRoute !== event.id.toString() && pathname.includes(linkRoute))
    );
  }

  return (
    <>
      <nav
        className={`easy-in border-muted hidden shrink-0 flex-col gap-3 overflow-hidden border-r transition-all duration-400 sm:flex ${isSideBarOpen ? "w-58" : "w-[60px]"}`}
      >
        {[
          ...sections,
          ...(blocks.length > 0 ? [{ title: t("blocks"), links: blocks }] : []),
        ].map((section, id) => (
          <div
            key={section.title}
            className={`pr-2 transition-all ${sections.length === id + 1 ? "" : "border-muted border-b-1 pb-3"} `}
          >
            <ul
              className={`space-y-2 transition-all duration-400 ease-in-out ${isSideBarOpen ? "pl-2" : "pl-0"}`}
            >
              {section.links.map((link) => (
                <Tooltip key={link.title} delayDuration={400}>
                  <TooltipTrigger asChild>
                    <li>
                      <Button
                        className={`w-full justify-start transition-all duration-400 ease-in-out`}
                        variant={
                          isActiveLink(link.route)
                            ? "eventDefault"
                            : "eventGhost"
                        }
                        asChild
                      >
                        <Link
                          href={`/dashboard/events/${event.id.toString()}/${link.route === event.id.toString() ? "" : link.route}`}
                        >
                          {link.icon}
                          <span
                            className={`min-w-0 truncate transition-all duration-400 ease-in-out ${isSideBarOpen ? "ml-2 w-auto opacity-100" : "ml-0 w-0 opacity-0"}`}
                          >
                            {link.title}
                          </span>
                        </Link>
                      </Button>
                    </li>
                  </TooltipTrigger>
                  {!isSideBarOpen && (
                    <TooltipContent side={"right"}>{link.title}</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <nav className="fixed bottom-0 left-0 z-50 flex w-full gap-6 bg-white/70 p-2 shadow-md backdrop-blur-sm sm:hidden dark:bg-gray-900/70 dark:shadow-black/20">
        <ul className="flex w-full justify-around">
          {[
            ...sections,
            ...(blocks.length > 0
              ? [
                  {
                    title: t("blocks"),
                    links: [
                      { title: t("blocks"), icon: <Cuboid />, route: "blocks" },
                    ],
                  },
                ]
              : []),
          ]
            .flatMap((section) => section.links)
            .map((link) => (
              <li key={link.title}>
                <Button
                  variant={
                    isActiveLink(link.route) ? "eventDefault" : "eventGhost"
                  }
                  size="icon"
                  className="size-10"
                >
                  <Link
                    href={`/dashboard/events/${event.id.toString()}/${link.route === event.id.toString() ? "" : link.route}`}
                  >
                    {link.icon}
                  </Link>
                </Button>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}
