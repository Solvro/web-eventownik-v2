"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TargetAndTransition, VariantLabels } from "motion/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "../../../components/ui/badge";

interface HighlightedEvent {
  name: string;
  year: number;
  description?: string;
  image: {
    src: string;
    alt: string;
  };
}

const events: HighlightedEvent[] = [
  {
    name: "RAJD „SHREKSPEDYCJA: WELCOME TO BAGNO”",
    description:
      "Organizatorom z WRSS W6, W8 i W12 został pilotażowo udostępniony Eventownik, aby przetestowali jego funkcjonalności i sprawdzili jak bardzo może usprawnić zarządzanie dużym wydarzeniem z liczną grupą uczestników.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/shrekspedycja.jpg",
      alt: "RAJD „SHREKSPEDYCJA: WELCOME TO BAGNO”",
    },
  },
  {
    name: 'Rejs "W8 na Fali"',
    description:
      "Po sukcesie Eventownika na Rajdzie, WuZetka postanowiła ponownie skorzystać z aplikacji przy organizacji ich kolejnego wydarzenia, czyli Rejsu 2025.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/rejs-w8.jpg",
      alt: 'Rejs "W8 na Fali"',
    },
  },
  {
    name: "Wyjazd do Graz w ramach Unite!",
    description:
      "Studenci z naszego Koła Solvro wzięli udział w wymianie do Graz w ramach programu Unite!  Podczas organizacji wyjazdu korzystali z Eventownika, co pozwoliło usprawnić organizację oraz komunikację, zapewniając płynny przebieg całego przedsięwzięcia.",
    year: 2025,
    image: {
      src: "/assets/landing/highlighted-events/wyjazd-graz.jpg",
      alt: "Wyjazd do Graz w ramach Unite!",
    },
  },
];

const variants = {
  left: {
    x: -500,
    y: -20,
    filter: "brightness(50%)",
    opacity: 0.8,
    rotate: 9,
    zIndex: 0,
  },
  center: {
    x: 0,
    y: 0,
    filter: "brightness(100%)",
    opacity: 1,
    rotate: 0,
    scale: 1.08,
    zIndex: 20,
  },
  right: {
    x: 500,
    y: -20,
    filter: "brightness(50%)",
    opacity: 0.8,
    rotate: -9,
    zIndex: 10,
  },
};

function CarouselImage({
  src,
  alt,
  initial,
  animate,
  title,
  description,
  year,
  onClick,
}: {
  src: string;
  alt: string;
  initial: TargetAndTransition;
  animate: VariantLabels;
  title: string;
  description?: string;
  year: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={variants}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute aspect-[25/16] h-[18rem] sm:h-[22rem] md:h-[26rem] lg:h-[30rem]"
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        className="border-input aspect-[25/16] h-full w-full rounded-4xl border object-cover"
        width={750}
        height={480}
      />
      <div className="absolute inset-0 flex h-full w-full flex-col items-start gap-2 rounded-4xl bg-gradient-to-r from-black/75 to-transparent px-8 py-8 text-left text-white sm:gap-4 sm:py-16">
        <Badge>{year}</Badge>
        <h3 className="text-2xl font-semibold sm:text-3xl">{title}</h3>
        {description == null ? null : (
          <p className="w-5/6 text-sm sm:w-4/5 sm:text-base md:w-3/4 md:text-lg">
            {description}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export function HighlightedEvents() {
  const variantsList = ["left", "center", "right"];
  const [index, setIndex] = useState(0);
  return (
    <div className="-mt-16 flex w-full flex-col items-start gap-16 overflow-x-hidden pt-16">
      <div className="relative flex h-[20rem] w-full justify-center sm:h-[24rem] md:h-[28rem] lg:h-[32rem]">
        <CarouselImage
          src={events[1].image.src}
          alt={events[1].image.alt}
          initial={variants.left}
          animate={variantsList[index]}
          year={events[1].year}
          title={events[1].name}
          description={events[1].description}
          onClick={() => {
            setIndex(1);
          }}
        />
        <CarouselImage
          src={events[2].image.src}
          alt={events[2].image.alt}
          initial={variants.right}
          animate={variantsList[(index + 2) % variantsList.length]}
          year={events[2].year}
          title={events[2].name}
          description={events[2].description}
          onClick={() => {
            setIndex(2);
          }}
        />
        <CarouselImage
          src={events[0].image.src}
          alt={events[0].image.alt}
          initial={variants.center}
          animate={variantsList[(index + 1) % variantsList.length]}
          year={events[0].year}
          title={events[0].name}
          description={events[0].description}
          onClick={() => {
            setIndex(0);
          }}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-6">
        <button
          title="Poprzednie zdjęcie"
          onClick={() => {
            setIndex((index - 1 + variantsList.length) % variantsList.length);
          }}
        >
          <ArrowLeft className="size-9" />
        </button>
        <button
          title="Następne zdjęcie"
          onClick={() => {
            setIndex((index + 1) % variantsList.length);
          }}
        >
          <ArrowRight className="size-9" />
        </button>
      </div>
    </div>
  );
}
