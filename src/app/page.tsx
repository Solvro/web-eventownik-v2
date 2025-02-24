import { BookText, Laptop, Server, Table } from "lucide-react";
import Link from "next/link";

import { AppLogo } from "@/components/app-logo";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header>
        <nav className="flex justify-between p-4">
          <AppLogo />
          <Link href="/events">Wydarzenia</Link>
          <div className="flex gap-4">
            <ThemeSwitch />
            <Button asChild>
              <Link href="/dashboard">Panel&#47;Dashboard</Link>
            </Button>
            <AuthButton />
          </div>
        </nav>
      </header>
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Eventownik v2</h1>
        <p className="text-lg">Work in progress</p>
        <div className="mt-4 flex gap-4">
          <Button asChild>
            <Link
              href="https://github.com/Solvro/web-eventownik-v2"
              target="_blank"
            >
              <Laptop className="mr-1 h-5 w-5" />
              Frontend
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://github.com/Solvro/backend-eventownik"
              target="_blank"
            >
              <Server className="mr-1 h-5 w-5" />
              Backend
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://github.com/orgs/Solvro/projects/5/views/1"
              target="_blank"
            >
              <Table className="mr-1 h-5 w-5" />
              Lista zadań
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://api.eventownik.solvro.pl/docs#tag/v1"
              target="_blank"
            >
              <BookText className="mr-1 h-5 w-5" />
              Dokumentacja API
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
