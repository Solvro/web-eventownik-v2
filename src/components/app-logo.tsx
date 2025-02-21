"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import DarkLogo from "@/../public/logo-dark.png";
import LightLogo from "@/../public/logo-light.png";

export function AppLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Link href="/" className="text-lg font-bold">
      <Image
        src={resolvedTheme === "dark" ? DarkLogo : LightLogo}
        alt="Eventownik"
      />
    </Link>
  ) : (
    <div className="h-[47px] w-[192px]"></div>
  );
}
