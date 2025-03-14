"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import DarkLogo from "@/../public/logo-dark.png";
import LightLogo from "@/../public/logo-light.png";

const getSource = (theme?: string) => {
  if (theme === "dark") {
    return DarkLogo;
  }
  return LightLogo;
};

export function AppLogo({
  forceTheme,
}: { forceTheme?: "dark" | "light" } = {}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Link href="/" className="text-lg font-bold">
      <Image
        src={forceTheme ? getSource(forceTheme) : getSource(resolvedTheme)}
        alt="Eventownik"
      />
    </Link>
  ) : (
    <div className="h-[47px] w-[192px]"></div>
  );
}
