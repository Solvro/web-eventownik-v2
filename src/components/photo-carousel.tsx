"use client";

import { cva } from "class-variance-authority";
import { AlertCircleIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { ViewTransition, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { cn } from "@/lib/utils";

import { Alert, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";

export interface PhotoCarouselItem {
  image: {
    src: string;
    alt: string;
  };
  title: string;
  description?: string;
  badgeLabel: string | number;
}

export type PhotoCarouselOrientation = "horizontal" | "vertical";

const carouselPositions = ["left", "center", "right"] as const;

const carouselVariantsByOrientation = {
  horizontal: {
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
      x: 0,
      y: 0,
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
  },
  vertical: {
    left: {
      x: 0,
      y: 12,
      filter: "brightness(60%)",
      opacity: 0.82,
      rotate: 4,
      zIndex: 0,
    },
    center: {
      x: 0,
      y: 0,
      filter: "brightness(100%)",
      opacity: 1,
      rotate: 0,
      zIndex: 20,
    },
    right: {
      x: 0,
      y: 0,
      filter: "brightness(60%)",
      opacity: 0.82,
      rotate: -4,
      zIndex: 10,
    },
  },
} as const;

type PhotoCarouselPosition =
  keyof typeof carouselVariantsByOrientation.horizontal;

const frameVariants = cva("relative flex justify-center", {
  variants: {
    orientation: {
      horizontal:
        "h-[calc((100vw-3rem)*18/25*1.08)] max-h-[520px] w-full sm:h-[calc((100vw-3rem)*16/25*1.08)] md:h-[calc(600px*16/25*1.08)]",
      vertical: "aspect-[4/5] w-100",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

const cardVariants = cva(
  "absolute left-1/2 h-auto min-w-0 -translate-x-1/2 md:w-full",
  {
    variants: {
      orientation: {
        horizontal:
          "aspect-[25/18] w-[calc(100%-3rem)] max-w-[600px] sm:aspect-[25/16]",
        vertical:
          "aspect-[4/5] w-[calc(100%-3rem)] max-w-[400px] sm:aspect-[4/5]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

const imageVariants = cva(
  "border-input h-auto w-full rounded-4xl border object-cover",
  {
    variants: {
      orientation: {
        horizontal: "aspect-[25/18] sm:aspect-[25/16]",
        vertical: "aspect-[4/5]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

const overlayVariants = cva(
  "absolute inset-0 flex h-full w-full flex-col items-start gap-2 rounded-4xl px-4 py-8 text-left text-white sm:gap-4 sm:px-8",
  {
    variants: {
      orientation: {
        horizontal: "bg-gradient-to-r from-black/75 to-transparent sm:py-16",
        vertical:
          "justify-end bg-gradient-to-t from-black/70 via-black/25 to-transparent sm:py-10",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function PhotoCarouselCard({
  item,
  animate,
  onSelect,
  index,
  totalItems,
  orientation,
  position,
}: {
  item: PhotoCarouselItem;
  animate: PhotoCarouselPosition;
  onSelect: (index: number) => void;
  index: number;
  totalItems: number;
  orientation: PhotoCarouselOrientation;
  position: PhotoCarouselPosition;
}) {
  const variants = carouselVariantsByOrientation[orientation];

  return (
    <ViewTransition
      default="photo-carousel-item photo-carousel-card"
      name={`photo-carousel-${index.toString()}`}
    >
      <motion.button
        type="button"
        variants={variants}
        initial={variants[position]}
        animate={animate}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={cardVariants({ orientation })}
        onClick={() => {
          onSelect(index);
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        dragTransition={{ bounceStiffness: 200, bounceDamping: 30 }}
        onDragEnd={(_, info) => {
          const swipeThreshold = 80;
          if (info.offset.x > swipeThreshold) {
            onSelect((index + 1) % totalItems);
          } else if (info.offset.x < -swipeThreshold) {
            onSelect((index - 1 + totalItems) % totalItems);
          }
        }}
        aria-label={item.title}
      >
        <div className="relative h-full w-full">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            className={imageVariants({ orientation })}
            width={750}
            height={540}
          />
          <div className={overlayVariants({ orientation })}>
            <ViewTransition
              default={`photo-carousel-item photo-carousel-content-${position}`}
              name={`photo-carousel-badge-${index.toString()}`}
            >
              <Badge>{item.badgeLabel}</Badge>
            </ViewTransition>

            <ViewTransition
              default={`photo-carousel-item photo-carousel-content-${position}`}
              name={`photo-carousel-title-${index.toString()}`}
            >
              <h3 className="text-2xl font-semibold max-sm:text-xl sm:text-3xl">
                {item.title}
              </h3>
            </ViewTransition>
            <ViewTransition
              default={`photo-carousel-item photo-carousel-content-${position}`}
              name={`photo-carousel-description-${index.toString()}`}
            >
              {item.description == null ? null : (
                <p className="w-7/8 text-xs max-[370px]:line-clamp-3 sm:w-4/5 sm:text-lg md:w-3/4">
                  {item.description}
                </p>
              )}
            </ViewTransition>
          </div>
        </div>
      </motion.button>
    </ViewTransition>
  );
}

export function PhotoCarousel({
  items,
  initialIndex = 0,
  orientation = "horizontal",
  index: externalIndex,
  setIndex: setExternalIndex,
  className,
}: {
  items: PhotoCarouselItem[];
  initialIndex?: number;
  orientation?: PhotoCarouselOrientation;
  index?: number;
  setIndex?: Dispatch<SetStateAction<number>>;
  className?: string;
}) {
  const [internalIndex, setInternalIndex] = useState(initialIndex);

  const index = externalIndex ?? internalIndex;
  const setIndex: Dispatch<SetStateAction<number>> = (nextIndex) => {
    const resolvedNextIndex =
      typeof nextIndex === "function" ? nextIndex(index) : nextIndex;

    if (externalIndex !== undefined && setExternalIndex !== undefined) {
      setExternalIndex(resolvedNextIndex);
    } else {
      setInternalIndex(resolvedNextIndex);
    }
  };

  if (items.length !== 3) {
    console.error(
      `PhotoCarousel requires exactly 3 items, but received ${items.length.toString()}.`,
    );
    return (
      <Alert variant="destructive" className="w-fit">
        <AlertCircleIcon />
        <AlertTitle>PhotoCarousel requires exactly 3 items.</AlertTitle>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        "-mt-16 flex flex-col items-start gap-8 pt-16 lg:gap-16",
        orientation === "horizontal" && "w-full",
        className,
      )}
    >
      <div className={frameVariants({ orientation })}>
        <PhotoCarouselCard
          item={items[1]}
          animate={carouselPositions[index]}
          onSelect={setIndex}
          index={1}
          totalItems={items.length}
          orientation={orientation}
          position="left"
        />
        <PhotoCarouselCard
          item={items[2]}
          animate={carouselPositions[(index + 2) % carouselPositions.length]}
          onSelect={setIndex}
          index={2}
          totalItems={items.length}
          orientation={orientation}
          position="right"
        />
        <PhotoCarouselCard
          item={items[0]}
          animate={carouselPositions[(index + 1) % carouselPositions.length]}
          onSelect={setIndex}
          index={0}
          totalItems={items.length}
          orientation={orientation}
          position="center"
        />
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-6">
        <button
          type="button"
          title="Poprzednie zdjęcie"
          aria-label="Poprzednie zdjęcie"
          onClick={() => {
            setIndex((currentIndex) => {
              return (
                (currentIndex - 1 + carouselPositions.length) %
                carouselPositions.length
              );
            });
          }}
        >
          <ArrowLeft className="size-9" />
        </button>
        <button
          type="button"
          title="Następne zdjęcie"
          aria-label="Następne zdjęcie"
          onClick={() => {
            setIndex((currentIndex) => {
              return (currentIndex + 1) % carouselPositions.length;
            });
          }}
        >
          <ArrowRight className="size-9" />
        </button>
      </div>
    </div>
  );
}
