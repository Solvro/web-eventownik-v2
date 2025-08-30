import { ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { buttonVariants } from "../ui/button";
import { Input } from "../ui/input";

export function Footer() {
  return (
    <footer className="flex w-full flex-col items-center">
      <div className="container flex w-full flex-col items-center justify-between gap-32 px-8 py-16 2xl:flex-row 2xl:items-center">
        <div className="flex w-full flex-col gap-16 2xl:w-auto">
          <p className="text-3xl font-medium">
            Zostań na bieżąco z Eventownikiem Solvro <br /> i zapisz się do
            newslettera.
          </p>
          <div className="border-input flex flex-row items-center gap-4 border-b focus-within:border-black dark:focus-within:border-white">
            <Input
              className="rounded-none border-0 focus-visible:ring-0"
              placeholder="Adres e-mail"
            />
            <ArrowRight />
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-12 2xl:w-auto">
          <div className="flex w-full flex-row gap-12">
            <Link href="/">Regulamin</Link>
            <Link href="/">Polityka prywatności</Link>
            <Link href="/">Pliki Cookies</Link>
            <Link href="/">RODO</Link>
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-8">
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
            <div className="z-10 flex w-full flex-col items-center gap-16 p-16">
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
              <div className="container grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
                <p>
                  Design by <span className="font-bold">Matthew Design</span>
                </p>
                <p className="flex flex-row items-center gap-1 whitespace-nowrap lg:justify-center">
                  Made with <Heart className="fill-rose-500" strokeWidth={0} />{" "}
                  <span className="font-bold">
                    by Solvro © {new Date().getFullYear()}
                  </span>
                </p>
                <span />
              </div>
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
