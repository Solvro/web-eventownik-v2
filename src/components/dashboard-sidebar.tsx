"use client";

import {
  ClipboardPenLine,
  Cuboid,
  Mail,
  Play,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
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
      title: "Ogólne",
      links: [
        {
          title: "Wydarzenie",
          icon: <Play />,
          route: event.id.toString(),
        },
        {
          title: "Formularze",
          icon: <ClipboardPenLine />,
          route: "forms",
        },
        {
          title: "Ustawienia",
          icon: <SlidersHorizontal />,
          route: "settings",
        },
      ],
    },
    {
      title: "Uczestnicy",
      links: [
        {
          title: "Lista uczestników",
          icon: <Users />,
          route: "participants",
        },
      ],
    },
    {
      title: "Maile",
      links: [
        {
          title: "Szablony maili",
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
      <nav className="border-muted hidden min-w-[240px] shrink-0 flex-col gap-6 border-r pr-8 sm:flex">
        {[
          ...sections,
          ...(blocks.length > 0 ? [{ title: "Bloki", links: blocks }] : []),
        ].map((section) => (
          <div key={section.title}>
            <h2 className="mb-6 text-3xl font-bold">{section.title}</h2>
            <ul className="flex flex-col gap-2 pl-2">
              {section.links.map((link) => (
                <li key={link.title}>
                  <Button
                    className="w-full justify-start"
                    variant={
                      isActiveLink(link.route) ? "eventDefault" : "eventGhost"
                    }
                    asChild
                  >
                    <Link
                      href={`/dashboard/events/${event.id.toString()}/${link.route === event.id.toString() ? "" : link.route}`}
                    >
                      {link.icon}
                      {link.title}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <nav className="flex gap-6 sm:hidden">
        <ul className="flex w-full justify-around gap-2">
          {[
            ...sections,
            ...(blocks.length > 0
              ? [
                  {
                    title: "Bloki",
                    links: [
                      { title: "Bloki", icon: <Cuboid />, route: "blocks" },
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
                  asChild
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
