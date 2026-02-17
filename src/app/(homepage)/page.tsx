import Image from "next/image";

import { Events } from "@/app/(homepage)/sections/events";
import { Footer } from "@/app/(homepage)/sections/footer";
import { Functionalities } from "@/app/(homepage)/sections/functionalities";
import { Hero } from "@/app/(homepage)/sections/hero";
import { HighlightedEvents } from "@/app/(homepage)/sections/highlighted-events";
import { Navbar } from "@/app/(homepage)/sections/navbar";
import { Partners } from "@/app/(homepage)/sections/partners";
import { Team } from "@/app/(homepage)/sections/team";
import { ToPWr } from "@/app/(homepage)/sections/to-pwr";

export default function Home() {
  return (
    <div className="text-foreground min-h-screen">
      <div className="relative flex h-full w-full items-center bg-gradient-to-r from-[#E9EAEE] to-[#6f83af] dark:from-[#101011] dark:to-[#213560]">
        <div className="z-10 flex w-full flex-col items-center gap-20 pt-4 lg:pt-12">
          <Navbar />
          <Hero />
          <HighlightedEvents />
          <Events />
          <Functionalities />
        </div>
        <Image
          src={"/assets/landing/footer_bg.webp"}
          alt=""
          width={3000}
          height={3000}
          className="absolute inset-0 w-full [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] object-cover opacity-10"
        />
      </div>
      <div className="border-input flex w-full flex-col items-center border-t border-dashed bg-white dark:bg-[#101011]">
        <div className="flex w-full flex-col items-center px-4">
          <Team />
          <ToPWr />
        </div>
        <Partners />
        <Footer />
      </div>
    </div>
  );
}
