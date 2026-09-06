"use client";

import { atom, useAtom } from "jotai";

import { highlightedEvents } from "@/app/(homepage)/sections/highlighted-events-data";
import { PhotoCarousel } from "@/components/photo-carousel";

const highlightedEventsCarouselIndexAtom = atom(0);

export function HighlightedEventsCarousel(
  props: Partial<React.ComponentProps<typeof PhotoCarousel>>,
) {
  const [index, setIndex] = useAtom(highlightedEventsCarouselIndexAtom);

  return (
    <PhotoCarousel
      orientation="horizontal"
      items={highlightedEvents.map((event_) => ({
        image: event_.image,
        title: event_.name,
        description: event_.description,
        badgeLabel: event_.year,
      }))}
      index={index}
      setIndex={setIndex}
      {...props}
    />
  );
}
