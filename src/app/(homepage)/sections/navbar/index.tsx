import Link from "next/link";

import { AuthButton } from "@/components/auth-button";

import { ThemeSwitch } from "../../../../components/theme-switch";
import { AppLogo } from "../app-logo";
import { MobileNavbar } from "./mobile-navbar";

export function Navbar() {
  return (
    <div className="flex w-full flex-col items-center px-4">
      {/* Mobile Navbar */}
      <MobileNavbar
        authButton={<AuthButton variant="default" className="w-full" />}
      />
      {/* Desktop Navbar */}
      <header className="bg-background border-border container hidden w-full flex-row items-center justify-between gap-4 rounded-2xl border p-3 lg:flex xl:max-w-6xl">
        <div className="flex items-center gap-8 uppercase">
          <h1 className="sr-only">Eventownik</h1>
          <AppLogo />
          <Link href="#events">Wydarzenia</Link>
          <Link href="#functionalities">Funkcjonalności</Link>
          <Link href="#faq">FAQ</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <AuthButton variant="default" />
        </div>
      </header>
    </div>
  );
}
