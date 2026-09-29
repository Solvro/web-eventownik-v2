import { ArrowRight, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/Solvro/web-eventownik-v2",
    icon: FaGithub,
    labelKey: "eventownikGithubRepo",
  },
  {
    href: "https://www.instagram.com/knsolvro/",
    icon: FaInstagram,
    labelKey: "solvroInstagram",
  },
  {
    href: "https://www.facebook.com/knsolvro",
    icon: FaFacebook,
    labelKey: "solvroFacebook",
  },
  {
    href: "https://www.linkedin.com/company/knsolvro/",
    icon: FaLinkedin,
    labelKey: "solvroLinkedIn",
  },
] as const;

export function Footer() {
  const t = useTranslations("Homepage");
  return (
    <footer className="z-10 flex w-full flex-col items-center bg-white dark:bg-[#101011]">
      <div className="container flex w-full flex-col items-center justify-between gap-16 px-8 pt-16 pb-8 sm:gap-32 sm:py-16 2xl:flex-row 2xl:items-center">
        <div className="flex w-full flex-col text-3xl font-medium 2xl:w-auto">
          <h2>{t("stayUpdatedWithEventownik")}</h2>
          <Link
            href="/newsletter-eventownik"
            className="flex flex-row items-center gap-2 text-[#6583C8] hover:underline"
          >
            <span className="text-[#6583C8]">
              {t("andSubscribeToNewsletter")}
            </span>
            <ArrowRight size={32} />
          </Link>
          {/*
          <div className="border-input flex flex-row items-center gap-4 border-b focus-within:border-black dark:focus-within:border-white">
            <Input
              className="rounded-none border-0 focus-visible:ring-0"
              placeholder="Adres e-mail"
            />
            <ArrowRight />
          </div>
          */}
        </div>
        <div className="flex w-full flex-col items-center gap-12 2xl:w-auto">
          <div className="flex w-full flex-row flex-wrap justify-center gap-6 sm:flex-nowrap sm:justify-end sm:gap-12">
            <a
              href="/documents/regulamin.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("termsOfService")}
            </a>
            <a href="mailto:eventownik@pwr.edu.pl?subject=Zgłoszenie%20błędu">
              {t("reportBug")}
            </a>
          </div>
          <div className="flex w-full flex-col items-center justify-between gap-8 sm:flex-row">
            <a
              title={t("knSolvro")}
              href="https://solvro.pwr.edu.pl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/logo/solvro_black.png"
                alt={t("solvroLogoAlt")}
                className="block dark:hidden"
                width={200}
                height={200}
              />
              <Image
                src="/assets/logo/solvro_white.png"
                alt={t("solvroLogoAlt")}
                className="hidden dark:block"
                width={200}
                height={200}
              />
            </a>
            <div className="flex flex-row gap-6">
              {SOCIAL_LINKS.map(({ href, icon: Icon, labelKey }) => (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <a
                      href={href}
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "aspect-square rounded-full p-2",
                      )}
                      rel="noopener noreferrer"
                    >
                      <Icon aria-hidden="true" />
                      <span className="sr-only">{t(labelKey)}</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{t(labelKey)}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container w-full p-4">
        <div className="border-input relative overflow-hidden rounded-4xl border border-dashed">
          <div className="flex w-full flex-col items-center">
            <div className="z-10 flex w-full flex-col justify-between gap-4 p-4 sm:gap-16 sm:p-16">
              <div className="container flex w-full flex-row items-center justify-center gap-8">
                <Image
                  src="/logo_outline_light.png"
                  alt=""
                  width="1500"
                  height="1000"
                  className="block dark:hidden"
                />
                <Image
                  src="/logo_outline_dark.png"
                  alt=""
                  width="1500"
                  height="1000"
                  className="hidden dark:block"
                />
              </div>
              <p className="flex w-full flex-row items-center justify-center gap-1 whitespace-nowrap sm:justify-start lg:justify-center">
                Made with <Heart className="fill-rose-500" strokeWidth={0} />{" "}
                <span className="font-bold">
                  by Solvro © {new Date().getFullYear()}
                </span>
              </p>
            </div>
            <div className="absolute h-[64rem] w-6xl bg-gradient-to-br from-transparent from-20% via-[#3A5BA4]/60 via-35% to-transparent to-50% blur-lg dark:via-[#1A2640]" />
          </div>

          <Image
            src={"/assets/landing/footer_bg.jpg"}
            alt=""
            width={1600}
            height={500}
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
        </div>
      </div>
    </footer>
  );
}
