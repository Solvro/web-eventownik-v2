"use client";

import {
  ClipboardPenLine,
  Mail,
  Play,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

interface SidebarLink {
  title: string;
  icon: React.ReactNode;
  route: string;
}

export function DashboardSidebar({ id }: { id: string }) {
  const pathname = usePathname();

  const sections: SidebarSection[] = [
    {
      title: "Ogólne",
      links: [
        {
          title: "Wydarzenie",
          icon: <Play />,
          route: id,
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

  return (
    <>
      <nav className="border-muted hidden min-w-[240px] flex-col gap-6 border-r pr-8 sm:flex">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-6 text-3xl font-bold">{section.title}</h2>
            <ul className="flex flex-col gap-2 pl-2">
              {section.links.map((link) => (
                <li key={link.title}>
                  <Button
                    className="w-full justify-start"
                    variant={
                      pathname.endsWith(link.route) ? "default" : "ghost"
                    }
                    asChild
                  >
                    <Link
                      href={`/dashboard/events/${id}/${link.route === id ? "" : link.route}`}
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
          {sections.flatMap((section) =>
            section.links.map((link) => (
              <li key={link.title}>
                <Button
                  variant={pathname.endsWith(link.route) ? "default" : "ghost"}
                  asChild
                >
                  <Link
                    href={`/dashboard/events/${id}/${link.route === id ? "" : link.route}`}
                  >
                    {link.icon}
                  </Link>
                </Button>
              </li>
            )),
          )}
        </ul>
      </nav>
    </>
  );
}
