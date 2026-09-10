"use client";

import {
  ClipboardPenLine,
  Cuboid,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useState } from "react";

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
  icon: React.ReactNode;
  route: string;
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

  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

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
        className={`easy-in border-muted hidden shrink-0 flex-col gap-6 overflow-hidden border-r transition-all duration-400 sm:flex ${isSideBarOpen ? "w-64 pr-8" : "w-[45px] min-w-[45px] pr-2"}`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              size={isSideBarOpen ? "default" : "icon"}
              onClick={() => {
                setIsSideBarOpen(!isSideBarOpen);
              }}
              className={`overflow-hidden transition-all duration-400 ease-in-out ${isSideBarOpen ? "w-full justify-start" : "w-auto justify-start gap-0"}`}
            >
              <PanelLeftOpen
                className={`transition-all duration-100 ${isSideBarOpen ? "absolute opacity-0" : "mx-2 opacity-100"}`}
              />
              <PanelLeftClose
                className={`transition-all duration-100 ${isSideBarOpen ? "opacity-100" : "absolute mx-2 opacity-0"}`}
              />
              <span
                className={`transition-all duration-400 ease-in-out ${isSideBarOpen ? "ml-2 max-w-md -translate-x-[0px] opacity-100" : "ml-0 max-w-0 -translate-x-[5px] opacity-0"}`}
              >
                {t("closeSidebar")}
              </span>
            </Button>
          </TooltipTrigger>
          {!isSideBarOpen && (
            <TooltipContent side={"right"}>{t("openSidebar")}</TooltipContent>
          )}
        </Tooltip>
        {[
          ...sections,
          ...(blocks.length > 0 ? [{ title: t("blocks"), links: blocks }] : []),
        ].map((section) => (
          <div key={section.title}>
            <h2
              className={`overflow-hidden text-3xl font-bold whitespace-nowrap transition-all duration-400 ease-in-out ${isSideBarOpen ? "mb-6 max-h-10 opacity-100" : "mb-0 max-h-0 max-w-0 opacity-0"} `}
            >
              {section.title}
            </h2>
            <ul
              className={`space-y-2 transition-all duration-400 ease-in-out ${isSideBarOpen ? "pl-2" : "pl-0"}`}
            >
              {section.links.map((link) => (
                <Tooltip key={link.title}>
                  <TooltipTrigger asChild>
                    <li>
                      <Button
                        className={`transition-all duration-400 ease-in-out ${isSideBarOpen ? "w-full justify-start" : "justify-center"}`}
                        variant={
                          isActiveLink(link.route)
                            ? "eventDefault"
                            : "eventGhost"
                        }
                        size={isSideBarOpen ? "default" : "icon"}
                        asChild
                      >
                        <Link
                          href={`/dashboard/events/${event.id.toString()}/${link.route === event.id.toString() ? "" : link.route}`}
                        >
                          {link.icon}
                          <span
                            className={`transition-all duration-400 ease-in-out ${isSideBarOpen ? "ml-2 w-auto opacity-100" : "ml-0 hidden w-0 opacity-0"}`}
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
