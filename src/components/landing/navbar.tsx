import { Bug, Github } from "lucide-react";
import Link from "next/link";

import { AppLogo } from "../landing/app-logo";
import { ThemeSwitch } from "../theme-switch";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <header className="bg-background border-border container flex w-full flex-row items-center justify-between gap-16 rounded-2xl border p-3 xl:max-w-6xl">
      <div className="flex items-center gap-8 uppercase">
        <h1 className="sr-only">Eventownik</h1>
        <AppLogo />
        <Link href="/">Wydarzenia</Link>
        <Link href="/">Funkcjonalności</Link>
        <Link href="/">FAQ</Link>
      </div>
      <div className="flex items-center gap-4">
        <a
          target="_blank"
          href="https://github.com/Solvro/web-eventownik-v2"
          rel="noreferrer noopener"
        >
          <Button variant="outline">
            <Github />
            Daj nam gwiazdkę
          </Button>
        </a>
        <a
          target="_blank"
          href="https://solvro.pwr.edu.pl/contact/"
          rel="noreferrer noopener"
        >
          <Button variant="outline">
            <Bug />
            Zgłoś błąd
          </Button>
        </a>
        <ThemeSwitch />
      </div>
    </header>
  );
}
