"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { HighlightedEventsCarousel } from "@/components/highlighted-events-carousel";
import type { EventCategory } from "@/types/categories";
import { CATEGORY_LABELS } from "@/types/categories";

export function HeroSection({ onSearch }: { onSearch: (q: string) => void }) {
  const [searchInput, setSearchInput] = useState("");

  const quickFilterCategories: EventCategory[] = [
    "parties",
    "trips",
    "sport",
    "cultural",
  ];

  return (
    <section className="relative w-full overflow-hidden pt-10 pb-20">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex w-full flex-col gap-8">
            <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Odkryj wydarzenia
              <br />
              na{" "}
              <span className="text-[#3873FF]">
                Politechnice
                <br />
                Wrocławskiej
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-[1.3] font-medium tracking-tight text-[#191A1A] sm:text-xl dark:text-[#bbc1cf]">
              Konferencje, hackathony, warsztaty, imprezy i wiele więcej —
              wszystkie aktywności studenckiej społeczności PWr w jednym miejscu
              i od razu z możliwością zapisów!
            </p>

            <div className="flex w-full max-w-[643px] items-center justify-between rounded-[24px] bg-white py-2 pr-2 pl-6">
              <div className="flex flex-1 items-center gap-2">
                <SearchIcon className="size-6 shrink-0 text-[#8a8f9d]" />
                <input
                  type="text"
                  placeholder="Szukaj wydarzenia..."
                  value={searchInput}
                  onChange={(changeEvent) => {
                    setSearchInput(changeEvent.target.value);
                  }}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === "Enter") {
                      onSearch(searchInput);
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-base font-medium tracking-tight text-[#191A1A] outline-none placeholder:text-[#8a8f9d] sm:text-xl"
                />
              </div>
              <button
                onClick={() => {
                  onSearch(searchInput);
                }}
                className="shrink-0 rounded-[16px] bg-[#3873FF] px-6 py-3 text-base font-medium tracking-tight text-white transition hover:bg-[#2d5fd4]"
              >
                Szukaj
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {quickFilterCategories.map((cat) => (
                <span
                  key={cat}
                  className="border-foreground/60 text-foreground cursor-default rounded-full border px-5 py-2 text-base font-bold tracking-tight select-none"
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap gap-12 sm:gap-24">
              <div>
                <p className="text-foreground text-4xl font-bold">12</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Organizacji, z którymi
                  <br />
                  współpracujemy
                </p>
              </div>
              <div>
                <p className="text-foreground text-4xl font-bold">15k+</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Użytkowników aplikacji
                </p>
              </div>
              <div>
                <p className="text-foreground text-4xl font-bold">70k+</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Wyświetleń wydarzeń
                </p>
              </div>
            </div>
          </div>

          {/* Right: Carousel */}
          <div className="hidden w-full shrink-2 xl:flex">
            <HighlightedEventsCarousel orientation="vertical" />
          </div>
        </div>
      </div>
    </section>
  );
}
