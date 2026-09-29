"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { AppLogo } from "@/components/app-logo";
import { useDashboardSidebar } from "@/components/dashboard-sidebar";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

import { LanguageSwitch } from "./language-switch";

export function Navbar({ authButton }: { authButton: React.ReactNode }) {
  const t = useTranslations("Dashboard");
  const sidebarT = useTranslations("Sidebar");
  const { isSideBarOpen, toggleSideBar } = useDashboardSidebar();

  const navigation = [
    // { name: "Dashboard", href: "/dashboard" },
    { name: t("events"), href: "/dashboard/events" },
    // { name: t("accountSettings"), href: "/dashboard/settings" },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isEventDashboard = pathname.startsWith("/dashboard/events/");

  const isCurrent = (href: string) => {
    if (pathname === "/dashboard" && href === "/dashboard") {
      return true;
    }
    return pathname.startsWith(href) && href !== "/dashboard";
  };

  return (
    <nav className="w-full">
      <Collapsible.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <div className="mx-auto">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
              <Collapsible.Trigger asChild>
                <Button variant="ghost" className="px-3 [&_svg]:size-6">
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </Collapsible.Trigger>
            </div>

            <div className="flex flex-1 items-center gap-x-8 sm:items-stretch sm:justify-start">
              {isEventDashboard ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    isSideBarOpen
                      ? sidebarT("closeSidebar")
                      : sidebarT("openSidebar")
                  }
                  title={
                    isSideBarOpen
                      ? sidebarT("closeSidebar")
                      : sidebarT("openSidebar")
                  }
                  onClick={toggleSideBar}
                  className={"my-auto"}
                >
                  {isSideBarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                </Button>
              ) : null}
              <div className="flex shrink-0 items-center">
                <AppLogo />
              </div>
              <div className="hidden sm:flex sm:items-center sm:gap-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={
                      isCurrent(item.href) ? "underline" : "no-underline"
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
              {authButton}
            </div>
          </div>
        </div>

        <Collapsible.Content className="data-[state=closed]:hidden data-[state=open]:block sm:hidden">
          <div className="space-y-1 px-2 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={
                  isCurrent(item.href)
                    ? "bg-primary/10 block rounded-md px-3 py-2 text-base font-medium"
                    : "hover:bg-primary/10 hover:text-primary-foreground block rounded-md px-3 py-2 text-base font-medium"
                }
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex justify-end gap-2 py-2">
            <LanguageSwitch />
            <ThemeSwitch />
            {authButton}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </nav>
  );
}
