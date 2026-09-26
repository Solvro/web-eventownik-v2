"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

import { AppLogo } from "../app-logo";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function MobileNavbar({ authButton }: { authButton: React.ReactNode }) {
  const t = useTranslations("Homepage");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";

    const getFocusableElements = () =>
      [
        ...(menuRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ) ?? []),
      ].filter((element) => element.offsetParent !== null);

    getFocusableElements().at(0)?.focus();

    // Keep keyboard focus cycling within the menu while it's open
    const handleKeyDown = (event: KeyboardEvent) => {
      // Nested components (e.g. dropdowns) may handle Tab themselves
      if (event.key !== "Tab" || event.defaultPrevented) {
        return;
      }

      const focusableElements = getFocusableElements();
      const first = focusableElements.at(0);
      const last = focusableElements.at(-1);
      if (first === undefined || last === undefined) {
        event.preventDefault();
        return;
      }

      const active = document.activeElement;
      const isFocusInside = menuRef.current?.contains(active) ?? false;

      if (event.shiftKey && (active === first || !isFocusInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !isFocusInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflowY = previousOverflowY;
    };
  }, [isOpen]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <header className="container flex w-full flex-row items-center justify-between gap-4 lg:hidden">
        <div className="bg-background flex flex-col items-center justify-center rounded-2xl border border-[#B2B2B2] p-3 dark:border-[#414141]">
          <AppLogo />
        </div>
        <Button
          ref={openButtonRef}
          variant="outline"
          className="bg-background aspect-square h-full rounded-2xl border border-[#B2B2B2] p-3 dark:border-[#414141] [&_svg]:size-8"
          title={t("openMenu")}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Menu />
        </Button>
      </header>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            ref={menuRef}
            id="mobile-menu"
            className="bg-background border-border fixed inset-0 z-50 flex h-svh w-full flex-col justify-between gap-8 p-8 lg:hidden"
          >
            <div className="flex w-full flex-col gap-8">
              <div className="flex w-full items-center justify-between">
                <AppLogo />
                <Button
                  variant="ghost"
                  className="p-0 [&_svg]:size-8"
                  title={t("closeMenu")}
                  onClick={() => {
                    setIsOpen(false);
                    openButtonRef.current?.focus();
                  }}
                >
                  <X />
                </Button>
              </div>
              <nav className="flex flex-col gap-4 text-3xl font-medium uppercase">
                <Link
                  href="#events"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {t("events")}
                </Link>
                <Link
                  href="#functionalities"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {t("features")}
                </Link>
                <Link
                  href="#faq"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  FAQ
                </Link>
                <Link
                  href="#team"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {t("team")}
                </Link>
              </nav>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <div className="flex w-full items-center justify-end gap-4">
                <LanguageSwitch />
                <ThemeSwitch />
              </div>
              {authButton}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
