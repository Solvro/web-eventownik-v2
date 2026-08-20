import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MainMetadata");

  return {
    title: {
      template: "%s | Eventownik",
      default: t("title"),
    },
    icons: [
      {
        rel: "icon",
        type: "image/x-icon",
        url: "/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    description: t("description"),
    robots: "index, follow",
    keywords: [
      "eventownik",
      t("keywords.events"),
      t("keywords.wust"),
      t("keywords.eventOrganization"),
    ],
    alternates: {
      canonical: "./",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "pl";

  let messages;
  try {
    messages = await getMessages({ locale });
  } catch {
    // Fallback messages will be handled by next-intl
    messages = {};
  }

  return (
    <html
      lang={locale}
      className="scroll-smooth"
      suppressHydrationWarning={true}
      data-scroll-behavior="smooth"
    >
      <body className={cn(spaceGrotesk.variable, "font-sans antialiased")}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <NextTopLoader />
            <Toaster />
            {children}
            <Script
              defer
              src="https://analytics.solvro.pl/script.js"
              data-website-id="150ddc78-fccf-4d84-9fec-316bf1a84fcb"
              data-domains="eventownik.solvro.pl"
            ></Script>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
