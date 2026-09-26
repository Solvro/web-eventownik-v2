"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TargetAndTransition, VariantLabels } from "motion/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "../../../components/ui/badge";

interface HighlightedEvent {
  name: string;
  /** Language of the name, set only if it differs from the page's language */
  nameLang?: string;
  year: number;
  description?: string;
  image: {
    src: string;
  };
}

const variants = {
  left: {
    x: "clamp(-500px, -22vw, -120px)",
    y: -20,
    filter: "brightness(50%)",
    opacity: 0.8,
    rotate: 9,
    zIndex: 0,
    scale: 1,
  },
  center: {
    x: "0vw",
    y: "0px",
    filter: "brightness(100%)",
    opacity: 1,
    rotate: 0,
    scale: 1.08,
    zIndex: 20,
  },
  right: {
    x: "clamp(120px, 22vw, 500px)",
    y: -20,
    filter: "brightness(50%)",
    opacity: 0.8,
    rotate: -9,
    zIndex: 10,
    scale: 1,
  },
};

function CarouselImage({
  src,
  initial,
  animate,
  title,
  titleLang,
  description,
  year,
  onClick,
  index,
}: {
  src: string;
  initial: TargetAndTransition;
  animate: VariantLabels;
  title: string;
  titleLang?: string;
  description?: string;
  year: number;
  onClick: (index: number) => void;
  index: number;
}) {
  return (
    <motion.button
      variants={variants}
      initial={initial}
      animate={animate}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className="absolute left-1/2 aspect-[25/18] h-auto w-[calc(100%-3rem)] max-w-150 min-w-0 -translate-x-1/2 sm:aspect-[25/16] md:w-full"
      onClick={() => {
        onClick(index);
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
      onDragEnd={(_, info) => {
        const swipeThreshold = 80;
        if (info.offset.x > swipeThreshold) {
          onClick((index + 1) % 3);
        } else if (info.offset.x < -swipeThreshold) {
          onClick((index - 1 + 3) % 3);
        }
      }}
      tabIndex={0}
    >
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt=""
          className="border-input aspect-[25/18] h-auto w-full rounded-4xl border object-cover sm:aspect-[25/16]"
          width={750}
          height={540}
        />
        <div className="absolute inset-0 flex h-full w-full flex-col items-start gap-2 rounded-4xl bg-gradient-to-r from-black/75 to-transparent px-4 py-8 text-left text-white sm:gap-4 sm:px-8 sm:py-16">
          <Badge>{year}</Badge>
          <h3
            lang={titleLang}
            className="text-2xl font-semibold max-sm:text-xl sm:text-3xl"
          >
            {title}
          </h3>
          {description == null ? null : (
            <p className="w-7/8 text-xs max-[370px]:line-clamp-3 sm:w-4/5 sm:text-lg md:w-3/4">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function HighlightedEvents() {
  const variantsList = ["left", "center", "right"];
  const [index, setIndex] = useState(0);
  const t = useTranslations("Homepage");

  const events: HighlightedEvent[] = [
    {
      name: 'RAJD "SHREKSPEDYCJA: WELCOME TO BAGNO"',
      nameLang: "pl",
      description: t("HighlightedEvents.event1Description"),
      year: 2025,
      image: {
        src: "/assets/landing/highlighted-events/shrekspedycja.jpg",
      },
    },
    {
      name: 'Rejs "W8 na Fali"',
      nameLang: "pl",
      description: t("HighlightedEvents.event2Description"),
      year: 2025,
      image: {
        src: "/assets/landing/highlighted-events/rejs-w8.jpg",
      },
    },
    {
      name: t("HighlightedEvents.event3Name"),
      description: t("HighlightedEvents.event3Description"),
      year: 2025,
      image: {
        src: "/assets/landing/highlighted-events/wyjazd-graz.jpg",
      },
    },
  ];

  return (
    <div className="-mt-16 flex w-full flex-col items-start gap-8 overflow-x-hidden pt-16 lg:gap-16">
      <div className="relative flex h-[calc((100vw-3rem)*18/25*1.08)] max-h-130 w-full justify-center sm:h-[calc((100vw-3rem)*16/25*1.08)] md:h-[calc(600px*16/25*1.08)]">
        <CarouselImage
          src={events[1].image.src}
          initial={variants.left}
          animate={variantsList[index]}
          year={events[1].year}
          title={events[1].name}
          titleLang={events[1].nameLang}
          description={events[1].description}
          onClick={setIndex}
          index={1}
        />
        <CarouselImage
          src={events[2].image.src}
          initial={variants.right}
          animate={variantsList[(index + 2) % variantsList.length]}
          year={events[2].year}
          title={events[2].name}
          titleLang={events[2].nameLang}
          description={events[2].description}
          onClick={setIndex}
          index={2}
        />
        <CarouselImage
          src={events[0].image.src}
          initial={variants.center}
          animate={variantsList[(index + 1) % variantsList.length]}
          year={events[0].year}
          title={events[0].name}
          titleLang={events[0].nameLang}
          description={events[0].description}
          onClick={setIndex}
          index={0}
        />
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-6">
        <button
          title={t("previousImage")}
          onClick={() => {
            setIndex((index - 1 + variantsList.length) % variantsList.length);
          }}
        >
          <ArrowLeft className="size-9" />
        </button>
        <button
          title={t("nextImage")}
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
