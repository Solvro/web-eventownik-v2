import type { Metadata } from "next";
import Link from "next/link";

import { AppLogo } from "@/components/app-logo";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitch } from "@/components/theme-switch";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex justify-between p-4">
        <nav className="flex items-center gap-8">
          <AppLogo />
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/events">Wydarzenia</Link>
          <Link href="/dashboard/settings">Ustawienia konta</Link>
        </nav>
        <div className="flex gap-4">
          <ThemeSwitch />
          <AuthButton />
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-80px)] flex-col px-4 py-8">
        {children}
      </main>
    </div>
  );
}
