import { EventList } from "@/components/landing/event-list";
import { Footer } from "@/components/landing/footer";
import { Functionalities } from "@/components/landing/functionalities";
import { ImageCarousel } from "@/components/landing/image-carousel";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="text-foreground min-h-screen">
      <div className="flex w-full flex-col items-center gap-20 bg-gradient-to-r from-[#E9EAEE] to-[#6f83af] py-12 dark:from-[#101011] dark:to-[#213560]">
        <Navbar />
        <div className="container flex w-full flex-col items-center gap-8 px-4 text-center">
          <div className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5">
            <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 font-medium dark:bg-[#192237]">
              Spraw sobie niezapomniane wydarzenia
            </p>
          </div>
          <p className="text-8xl font-bold uppercase">Eventownik Solvro</p>
          <p className="text-3xl text-[#191A1A] dark:text-[#D9E8FF]">
            Zróbmy razem wydarzenie! Łatwo, bez stresu i z gwarancją sukcesu.
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
        <ImageCarousel />
        <EventList />
        <Functionalities />
      </div>
      <Footer />
    </div>
  );
}
