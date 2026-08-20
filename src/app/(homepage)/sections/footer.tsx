import { ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { buttonVariants } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export function Footer() {
  return (
    <footer className="z-10 flex w-full flex-col items-center bg-white dark:bg-[#101011]">
      <div className="container flex w-full flex-col items-center justify-between gap-16 px-8 pt-16 pb-8 sm:gap-32 sm:py-16 2xl:flex-row 2xl:items-center">
        <div className="flex w-full flex-col text-3xl font-medium 2xl:w-auto">
          <p>Zostań na bieżąco z Eventownikiem Solvro</p>
          <p>i zapisz się do newslettera.</p>
          <form
            className="border-input focus-within:border-foreground mt-8 flex w-full max-w-xl flex-row items-end gap-4 border-b pb-1"
            action="/newsletter-eventownik"
          >
            <Input
              type="email"
              name="email"
              aria-label="Adres email"
              className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 pb-2 text-xl font-normal shadow-none focus-visible:ring-0 sm:text-2xl md:text-2xl"
              placeholder="Adres email"
            />
            <button
              type="submit"
              aria-label="Zapisz się do newslettera"
              className="text-foreground shrink-0 pb-2"
            >
              <ArrowRight className="size-8" />
            </button>
          </form>
        </div>
        <div className="flex w-full flex-col items-center gap-12 2xl:w-auto">
          <div className="flex w-full flex-row flex-wrap justify-center gap-6 sm:flex-nowrap sm:justify-end sm:gap-12">
            <a
              href="/documents/regulamin.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Regulamin
            </a>
            <a href="mailto:eventownik@pwr.edu.pl?subject=Zgłoszenie%20błędu">
              Zgłoś błąd
            </a>
          </div>
          <div className="flex w-full flex-col items-center justify-between gap-8 sm:flex-row">
            <a
              title="Koło Naukowe Solvro"
              href="https://solvro.pwr.edu.pl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/logo/solvro_black.png"
                alt="Logo Koła Naukowego Solvro"
                className="block dark:hidden"
                width={200}
                height={200}
              />
              <Image
                src="/assets/logo/solvro_white.png"
                alt="Logo Koła Naukowego Solvro"
                className="hidden dark:block"
                width={200}
                height={200}
              />
            </a>
            <div className="flex flex-row gap-6">
              <a
                title="Repozytorium Eventownika na Githubie"
                href="https://github.com/Solvro/web-eventownik-v2"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "aspect-square rounded-full p-2",
                )}
                rel="noopener noreferrer"
              >
                <FaGithub />
              </a>
              <a
                title="Profil Koła Naukowego Solvro na Instagramie"
                href="https://www.instagram.com/knsolvro/"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "aspect-square rounded-full p-2",
                )}
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                title="Profil Koła Naukowego Solvro na Facebooku"
                href="https://www.facebook.com/knsolvro"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "aspect-square rounded-full p-2",
                )}
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
              <a
                title="Profil Koła Naukowego Solvro na LinkedIn"
                href="https://www.linkedin.com/company/knsolvro/"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "aspect-square rounded-full p-2",
                )}
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </a>
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
                  alt="Eventownik logo"
                  width="1500"
                  height="1000"
                  className="block dark:hidden"
                />
                <Image
                  src="/logo_outline_dark.png"
                  alt="Eventownik logo"
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
