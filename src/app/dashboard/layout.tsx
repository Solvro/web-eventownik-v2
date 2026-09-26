import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";

import { Alerts } from "@/components/alerts";
import { AuthButton } from "@/components/auth-button";
import { Navbar } from "@/components/navbar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");

  return {
    title: {
      template: "%s | Eventownik",
      default: t("organizerPanel"),
    },
  };
}

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
        <div className="flex min-h-[calc(100vh-96px)] flex-col p-4 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
