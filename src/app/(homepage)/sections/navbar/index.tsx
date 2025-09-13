import { Bug, Star } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

import { ThemeSwitch } from "../../../../components/theme-switch";
import { Button } from "../../../../components/ui/button";
import { AppLogo } from "../app-logo";
import { MobileNavbar } from "./mobile-navbar";

export function Navbar() {
  return (
    <div className="flex w-full flex-col items-center px-4">
      {/* Mobile Navbar */}
      <MobileNavbar />
      {/* Desktop Navbar */}
      <header className="bg-background border-border container hidden w-full flex-row items-center justify-between gap-4 rounded-2xl border p-3 lg:flex xl:max-w-6xl">
        <div className="flex items-center gap-8 uppercase">
          <h1 className="sr-only">Eventownik</h1>
          <AppLogo />
          <Link href="/">Wydarzenia</Link>
          <Link href="/">Funkcjonalności</Link>
          <Link href="/">FAQ</Link>
        </div>
        <div className="flex items-center gap-4">
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
          <Button asChild>
            <Link href="/auth/login">Zaloguj się</Link>
          </Button>
        </div>
      </header>
    </div>
  );
}
