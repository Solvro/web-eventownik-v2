"use client";

import { Bug, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

import { AppLogo } from "../app-logo";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <header className="container flex w-full flex-row items-center justify-between gap-4 lg:hidden">
        <div className="bg-background border-border flex flex-col items-center justify-center rounded-2xl border p-3">
          <h1 className="sr-only">Eventownik</h1>
          <AppLogo />
        </div>
        <Button
          variant="outline"
          className="border-border bg-background aspect-square h-full rounded-2xl border p-3 [&_svg]:size-8"
          title="Otwórz menu"
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
            className="bg-background border-border fixed inset-0 z-50 flex h-svh w-full flex-col justify-between gap-8 p-8 lg:hidden"
          >
            <div className="flex w-full flex-col gap-8">
              <div className="flex w-full items-center justify-between">
                <AppLogo />
                <Button
                  variant="ghost"
                  className="p-0 [&_svg]:size-8"
                  title="Otwórz menu"
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                >
                  <X />
                </Button>
              </div>
              <div className="flex flex-col gap-4 text-3xl font-medium uppercase">
                <Link href="/">Wydarzenia</Link>
                <Link href="/">Funkcjonalności</Link>
                <Link href="/">FAQ</Link>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <div className="flex w-full items-center justify-between gap-4">
                <Button variant="outline" asChild>
                  <a
                    target="_blank"
                    href="https://solvro.pwr.edu.pl/contact/"
                    rel="noreferrer noopener"
                  >
                    <Bug />
                    Zgłoś błąd
                  </a>
                </Button>
                <ThemeSwitch />
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Zaloguj się</Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
