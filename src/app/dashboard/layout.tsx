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
    <div
      // eslint-disable-next-line react/no-unknown-property
      vaul-drawer-wrapper=""
      className="bg-background min-h-screen"
    >
      <div className="container mx-auto">
        <header className="flex justify-between p-4">
          <Navbar authButton={<AuthButton />} />
        </header>
        <main className="flex min-h-[calc(100vh-96px)] flex-col p-4 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
