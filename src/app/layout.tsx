import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Eventownik",
    default: "Eventownik - organizacja wydarzeń",
  },
  description:
    "Eventownik to rozwiązanie służące wspomaganiu organizacji wydarzeń, ze szczególnym uwzględnieniem działalności Politechniki Wrocławskiej.",
  robots: "index, follow",
  keywords: [
    "eventownik",
    "wydarzenia",
    "politechnika wrocławska",
    "organizacja wydarzeń",
  ],
  alternates: {
    canonical: "./",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning={true}>
      <body className={cn(spaceGrotesk.variable, "font-sans antialiased")}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
