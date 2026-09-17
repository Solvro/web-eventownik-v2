import { useTranslations } from "next-intl";
import Link from "next/link";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemeSwitch } from "@/components/theme-switch";

import { AppLogo } from "../app-logo";
import { AuthButton } from "./auth-button";
import { MobileNavbar } from "./mobile-navbar";

export function Navbar() {
  const t = useTranslations("Homepage");

  return (
    <div className="flex w-full flex-col items-center px-4">
      {/* Mobile Navbar */}
      <MobileNavbar
        authButton={<AuthButton variant="default" className="w-full" />}
      />
      {/* Desktop Navbar */}
      <header className="bg-background container hidden w-full flex-row items-center justify-between gap-4 rounded-2xl border border-[#B2B2B2] p-3 lg:flex xl:max-w-6xl dark:border-[#414141]">
        <div className="flex items-center gap-8 uppercase">
          <h1 className="sr-only">Eventownik</h1>
          <AppLogo />
          <Link href="#events">{t("events")}</Link>
          <Link href="#functionalities">{t("features")}</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="#team">{t("team")}</Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <ThemeSwitch />
          <AuthButton variant="default" />
        </div>
      </header>
    </div>
  );
}
