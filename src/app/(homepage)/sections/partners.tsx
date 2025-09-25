import Image from "next/image";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function Partners() {
  return (
    <section
      id="partners"
      className="border-input z-10 flex w-full flex-col items-center border-y border-dashed bg-white dark:bg-[#101011]"
    >
      <div className="divide-input container flex w-full flex-col items-center justify-between divide-y divide-dashed sm:divide-x sm:divide-y-0 lg:flex-row">
        <div className="flex h-full w-full flex-col items-center justify-center px-16 py-8 sm:w-auto">
          <p className="h-full text-center text-2xl font-medium whitespace-nowrap uppercase sm:text-left">
            Zaufani partnerzy
          </p>
        </div>
        <ScrollArea>
          <div className="flex w-full flex-col items-center justify-evenly gap-16 px-16 py-8 lg:flex-row">
            <Image
              src={"/assets/logo/pwr.png"}
              alt={"Politechnika Wrocławska"}
              width={300}
              height={300}
              className="max-h-12 w-auto dark:invert"
            />
            <Image
              src={"/assets/logo/solvro_black.png"}
              alt={"Koło Naukowe Solvro"}
              width={300}
              height={300}
              className="max-h-12 w-auto dark:invert"
            />
            <Image
              src={"/assets/logo/wuzetka.png"}
              alt={"Samorząd Studencki Wydziału Zarządzania"}
              width={300}
              height={300}
              className="max-h-12 w-auto dark:invert"
            />
            <Image
              src={"/assets/logo/seohost.svg"}
              alt={"Seohost"}
              width={300}
              height={300}
              className="max-h-12 w-auto dark:invert"
            />
          </div>{" "}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
