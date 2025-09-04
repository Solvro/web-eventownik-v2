import { CalendarPlus } from "lucide-react";

import { EventList } from "@/app/(homepage)/sections/event-list";
import { Footer } from "@/app/(homepage)/sections/footer";
import { Functionalities } from "@/app/(homepage)/sections/functionalities";
import { HighlightedEvents } from "@/app/(homepage)/sections/highlighted-events";
import { Navbar } from "@/app/(homepage)/sections/navbar";
import { Partners } from "@/app/(homepage)/sections/partners";
import { Team } from "@/app/(homepage)/sections/team";
import { ToPWr } from "@/app/(homepage)/sections/to-pwr";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="text-foreground min-h-screen">
      <div className="flex w-full flex-col items-center gap-20 bg-gradient-to-r from-[#E9EAEE] to-[#6f83af] pt-12 dark:from-[#101011] dark:to-[#213560]">
        <Navbar />
        <div className="container flex w-full flex-col items-center gap-8 px-4 text-center">
          <div className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5">
            <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 font-medium dark:bg-[#192237]">
              #wytrzyma
            </p>
          </div>
          <p className="text-8xl font-bold uppercase">Eventownik Solvro</p>
          <p className="text-3xl text-[#191A1A] dark:text-[#D9E8FF]">
            Zróbmy razem wydarzenie!
          </p>
          <div className="flex flex-row items-center gap-4">
            <Button className="rounded-full bg-[#6583C8] px-5 py-4 text-lg font-medium hover:bg-[#4b78df]">
              <CalendarPlus />
              Stwórz wydarzenie
            </Button>
            <Button
              className="rounded-full border-2 border-black bg-transparent px-5 py-4 text-lg font-medium dark:border-white"
              variant={"outline"}
            >
              Przeglądaj wydarzenia
            </Button>
          </div>
        </div>
        <HighlightedEvents />
        <EventList />
        <Functionalities />
      </div>
      <div className="border-input flex w-full flex-col items-center border-t border-dashed bg-white dark:bg-[#101011]">
        <Team />
        <ToPWr />
        <Partners />
        <Footer />
      </div>
    </div>
  );
}
