"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { AppLogo } from "@/components/app-logo";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

const navigation = [
  // { name: "Dashboard", href: "/dashboard" },
  { name: "Wydarzenia", href: "/dashboard/events" },
  // { name: "Ustawienia konta", href: "/dashboard/settings" },
];

export function Navbar({ authButton }: { authButton: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

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
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <Collapsible.Trigger asChild>
                <Button variant="ghost" className="px-3 [&_svg]:size-6">
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </Collapsible.Trigger>
            </div>

            <div className="flex flex-1 items-center justify-center gap-x-8 sm:items-stretch sm:justify-start">
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
            <ThemeSwitch />
            {authButton}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </nav>
  );
}
