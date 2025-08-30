import { EventList } from "@/components/landing/event-list";
import { Footer } from "@/components/landing/footer";
import { Functionalities } from "@/components/landing/functionalities";
import { HighlightedEvents } from "@/components/landing/highlighted-events";
import { Navbar } from "@/components/landing/navbar";
import { Partners } from "@/components/landing/partners";
import { Team } from "@/components/landing/team";
import { ToPWr } from "@/components/landing/to-pwr";
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
          <div className="space-x-4">
            <Button className="rounded-full px-5 py-4 text-lg font-medium">
              Stwórz wydarzenie
            </Button>
            <Button
              className="rounded-full border-2 bg-transparent px-5 py-4 text-lg font-medium"
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
