/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image from "next/image";

import facebook from "@/assets/facebook.svg";
import github from "@/assets/github.svg";
import linkedin from "@/assets/linkedin.svg";
import logo_solvro_normal from "@/assets/logo_solvro_normal.png";
import pwr_logo from "@/assets/pwr_logo.svg";
import w_4 from "@/assets/w4_logo.svg";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer id="kontakt" className="bg-[#D9E8FF]">
      <div className="flex flex-col items-center justify-between px-12 py-20 md:flex-row md:justify-between">
        <div className="mb-8 flex flex-col md:mb-0">
          <Image
            src={logo_solvro_normal}
            alt="Solvro logo"
            width={168}
            height={36}
            className="mb-2"
          />
          <a href="mailto:kn.solvro@pwr.edu.pl">kn.solvro@pwr.edu.pl</a>
        </div>

        <div className="relative mb-8 text-center md:absolute md:left-1/2 md:mb-0 md:-translate-x-1/2 md:transform">
          <h3 className="mb-2 uppercase">Obserwuj nas</h3>
          <a
            href="https://github.com/Solvro/web-eventownik-v2"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mx-2 cursor-pointer rounded-full bg-[#152959] p-2 hover:bg-[#274276]",
            )}
          >
            <Image alt="Github" src={github} />
          </a>
          <a
            href="https://www.facebook.com/knsolvro"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mx-2 cursor-pointer rounded-full bg-[#152959] p-2 hover:bg-[#274276]",
            )}
          >
            <Image alt="Facebook" src={facebook} />
          </a>
          <a
            href="https://www.linkedin.com/company/knsolvro/"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mx-2 cursor-pointer rounded-full bg-[#152959] p-2 hover:bg-[#274276]",
            )}
          >
            <Image alt="Linkedin" src={linkedin} />
          </a>
        </div>
        <div className="flex flex-row">
          <Image src={w_4} alt="W4N logo" className="svg-black" />
          <Image src={pwr_logo} alt="Pwr logo" className="ml-5 svg-black" />
        </div>
      </div>
      <div className="bg-[#274276] py-6 text-center text-primary-foreground">
        <h3>
          Made with ❤️ by{" "}
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://solvro.pwr.edu.pl"
            className="hover:border-b-2"
          >
            Solvro
          </a>{" "}
          © {new Date().getFullYear()}
        </h3>
      </div>
    </footer>
  );
}
