import { EventList } from "@/app/(homepage)/sections/event-list";
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
      <div className="flex w-full flex-col items-center gap-20 bg-gradient-to-r from-[#E9EAEE] to-[#6f83af] pt-4 lg:pt-12 dark:from-[#101011] dark:to-[#213560]">
        <Navbar />
        <Hero />
        <HighlightedEvents />
        <EventList />
        <Functionalities />
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
