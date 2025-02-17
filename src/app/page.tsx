import { Package, Table } from "lucide-react";
import Link from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header>
        <nav className="flex justify-between p-4">
          <Link href="/" className="text-lg font-bold">
            Eventownik v2
          </Link>
          <div className="flex gap-4">
            <ThemeSwitch />
            <Button asChild>
              <Link href="/auth/login">Logowanie</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Rejestracja</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Panel&#47;Dashboard</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Eventownik v2</h1>
        <p className="text-lg">Work in progress</p>
        <div className="mt-4 flex gap-4">
          <Button asChild>
            <Link
              href="https://github.com/Solvro/web-eventownik-v2"
              target="_blank"
            >
              <Package className="mr-1 h-5 w-5" />
              web-eventownik-v2
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://github.com/Solvro/backend-eventownik"
              target="_blank"
            >
              <Package className="mr-1 h-5 w-5" />
              backend-eventownik
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://github.com/orgs/Solvro/projects/5/views/1"
              target="_blank"
            >
              <Table className="mr-1 h-5 w-5" />
              lista zadań
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
