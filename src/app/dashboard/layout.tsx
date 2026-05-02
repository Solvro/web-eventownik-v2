import type { Metadata } from "next";
import React from "react";

import { Alerts } from "@/components/alerts";
import { AuthButton } from "@/components/auth-button";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Eventownik",
    default: "Dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <header className="flex flex-col gap-4 p-4">
          <Navbar authButton={<AuthButton />} />
          <Alerts />
        </header>
        <main className="flex min-h-[calc(100vh-96px)] flex-col p-4 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
