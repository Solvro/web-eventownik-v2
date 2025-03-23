"use client";

import { Mail, Pen, Play, Sheet, SlidersHorizontal, Users } from "lucide-react";
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
          icon: <Sheet />,
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
          title: "Skrzynka odbiorcza",
          icon: <Mail />,
          route: "inbox",
        },
        {
          title: "Wyślij maila",
          icon: <Pen />,
          route: "send",
        },
      ],
    },
  ];

  return (
    <nav className="border-muted flex min-w-[240px] flex-col gap-6 border-r pr-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-6 text-3xl font-bold">{section.title}</h2>
          <ul className="flex flex-col gap-2 pl-2">
            {section.links.map((link) => (
              <li key={link.title}>
                <Button
                  className="w-full justify-start"
                  variant={pathname.endsWith(link.route) ? "default" : "ghost"}
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
  );
}
