import { Bug, Menu, Star } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

import { AppLogo } from "../landing/app-logo";
import { ThemeSwitch } from "../theme-switch";
import { Button } from "../ui/button";

export async function Navbar() {
  const repositoryData = await fetch(
    "https://api.github.com/repos/Solvro/web-eventownik-v2",
  );
  const { stargazers_count } = (await repositoryData.json()) as {
    stargazers_count: number;
  };
  return (
    <div className="flex w-full flex-col items-center px-8">
      <header className="bg-background border-border container flex w-full flex-row items-center justify-between gap-4 rounded-2xl border p-3 xl:max-w-6xl">
        <div className="flex items-center gap-8 uppercase">
          <h1 className="sr-only">Eventownik</h1>
          <AppLogo />
          <Link href="/" className="hidden lg:block">
            Wydarzenia
          </Link>
          <Link href="/" className="hidden lg:block">
            Funkcjonalności
          </Link>
          <Link href="/" className="hidden lg:block">
            FAQ
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden lg:block" asChild>
            <a
              target="_blank"
              href="https://github.com/Solvro/web-eventownik-v2"
              rel="noreferrer noopener"
            >
              <FaGithub />
              <p>Daj nam gwiazdkę</p>
              <Star fill="#3672FD" strokeWidth={0} size={20} />
              <p className="font-medium">{stargazers_count}</p>
            </a>
          </Button>
          <Button variant="outline" asChild className="hidden lg:block">
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
          <Button variant="outline" className="block lg:hidden">
            <Menu />
          </Button>
        </div>
      </header>
    </div>
  );
}
