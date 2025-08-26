"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TargetAndTransition, VariantLabels } from "motion/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "../ui/badge";

const events = [
  {
    name: "Event 1",
    description: "Event 1 description",
    year: 2025,
    image: {
      src: "/event-photo-placeholder.png",
      alt: "Event placeholder",
    },
  },
  {
    name: "Event 2",
    description: "Event 2 description",
    year: 2024,
    image: {
      src: "/event-photo-placeholder.png",
      alt: "Event placeholder",
    },
  },
  {
    name: "Event 3",
    description: "Event 3 description",
    year: 2023,
    image: {
      src: "/event-photo-placeholder.png",
      alt: "Event placeholder",
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
}: {
  src: string;
  alt: string;
  initial: TargetAndTransition;
  animate: VariantLabels;
  title: string;
  description: string;
  year: number;
}) {
  return (
    <motion.section
      variants={variants}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute h-[23.7rem] w-2xl"
    >
      <Image
        src={src}
        alt={alt}
        className="border-input h-full rounded-4xl border object-cover"
        width={750}
        height={480}
      />
      <div className="absolute inset-0 flex h-full w-full flex-col gap-4 rounded-4xl bg-gradient-to-r from-black/75 to-transparent px-8 py-16 text-white">
        <Badge>{year}</Badge>
        <h3 className="text-3xl font-semibold">{title}</h3>
        <p className="w-2/3 text-lg">{description}</p>
      </div>
    </motion.section>
  );
}

export function HighlightedEvents() {
  const variantsList = ["left", "center", "right"];
  const [index, setIndex] = useState(0);
  return (
    <div className="-mt-16 flex w-full flex-col items-start gap-16 overflow-hidden pt-16">
      <div className="relative flex h-[24rem] w-full justify-center">
        <CarouselImage
          src={events[0].image.src}
          alt={events[0].image.alt}
          initial={variants.left}
          animate={variantsList[index]}
          year={events[0].year}
          title={events[0].name}
          description={events[0].description}
        />
        <CarouselImage
          src={events[2].image.src}
          alt={events[2].image.alt}
          initial={variants.right}
          animate={variantsList[(index + 2) % variantsList.length]}
          year={events[2].year}
          title={events[2].name}
          description={events[2].description}
        />
        <CarouselImage
          src={events[1].image.src}
          alt={events[1].image.alt}
          initial={variants.center}
          animate={variantsList[(index + 1) % variantsList.length]}
          year={events[1].year}
          title={events[1].name}
          description={events[1].description}
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
