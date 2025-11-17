import type { Metadata } from "next";
import React from "react";

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
        <header className="flex justify-between p-4">
          <Navbar authButton={<AuthButton />} />
        </header>
        <main className="flex min-h-[calc(100vh-96px)] flex-col px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
