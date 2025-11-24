"use client";

import { useTheme } from "next-themes";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import DarkLogo from "@/../public/logo-icon-dark.svg";
import LightLogo from "@/../public/logo-icon-light.svg";

const getSource = (theme: string | undefined): StaticImageData => {
  if (theme === "dark") {
    return DarkLogo as StaticImageData;
  }
  return LightLogo as StaticImageData;
};

export function AppLogo({
  forceTheme,
}: { forceTheme?: "dark" | "light" } = {}) {
  const { resolvedTheme } = useTheme();

  return (
    <Link href="/">
      <Image
        src={forceTheme ? getSource(forceTheme) : getSource(resolvedTheme)}
        alt="Eventownik"
        className="h-8 w-9 sm:h-10 sm:w-11"
      />
    </Link>
  );
}
