import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Space_Grotesk } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Eventownik",
  description: "Eventownik v2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={cn(spaceGrotesk.variable, "font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
