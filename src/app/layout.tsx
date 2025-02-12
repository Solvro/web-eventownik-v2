import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "Eventownik",
  description: "Eventowo i kolorowo v2",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${spaceGrotesk.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
