"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TargetAndTransition, VariantLabels } from "motion/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "../ui/badge";

const images = [
  {
    src: "https://cdn.mos.cms.futurecdn.net/FgWBEA5raiBXkNQDrf9mte.jpg",
    alt: "Titans",
  },
  {
    src: "https://image.api.playstation.com/cdn/EP0006/CUSA04013_00/TGqPQusudXOvba747LKq0ANs6Cykqd43.jpg",
    alt: "Cover",
  },
  {
    src: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1237970/ss_f4a8464ce43962b76fa6f2156b341eee28ad6494.1920x1080.jpg?t=1726160226",
    alt: "Gameplay",
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
        className="border-input rounded-4xl border object-cover"
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
          src={images[0].src}
          alt={images[0].alt}
          initial={variants.left}
          animate={variantsList[index]}
          year={2016}
          title="Titans"
          description="The main battle-horses of Titanfall. Titans are massive hulking mechanical beasts, highly equipped with various tactical systems and heavy weaponry."
        />
        <CarouselImage
          src={images[2].src}
          alt={images[2].alt}
          initial={variants.right}
          animate={variantsList[(index + 2) % variantsList.length]}
          year={2016}
          title="Gameplay"
          description="The gameplay of Titanfall 2 is a seamless blend of fast-paced first-person shooting and fluid parkour movement."
        />
        <CarouselImage
          src={images[1].src}
          alt={images[1].alt}
          initial={variants.center}
          animate={variantsList[(index + 1) % variantsList.length]}
          year={2016}
          title="Titanfall 2"
          description="The sequel to the acclaimed Titanfall, featuring a single-player campaign and improved multiplayer."
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
