"use client";

import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TimelineStep({
  month,
  monthNumber,
  isActive,
  onClick,
}: {
  month: string;
  monthNumber: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
          "text-4xl uppercase transition",
          isActive
            ? "font-extrabold text-[#3458ae] dark:text-[#7294e2]"
            : "font-semibold",
        )}
      >
        {month}
      </button>
      <div className="flex flex-row items-end gap-6">
        {Array.from({ length: 11 }).map((_, index) => (
          <span
            className={cn(
              "block",
              // Make the lines transparent if they are out of bounds
              (index < 5 && monthNumber === 0) ||
                (index > 5 && monthNumber === 11)
                ? "bg-transparent"
                : "bg-[#414141] dark:bg-[#d6d6d6]",
              // Full line for under the month
              index === 5
                ? "h-10 w-px"
                : // Remove the last line so they won't stack up
                  index === 10 && monthNumber !== 11
                  ? "w-0"
                  : "h-5 w-px",
            )}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export function Timeline({
  month,
  setMonth,
}: {
  month: number;
  setMonth: (month: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Get the width of the timeline
  useLayoutEffect(() => {
    if (ref.current != null) {
      setWidth(ref.current.offsetWidth);
    }
  }, [ref]);

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  return (
    <div className="relative flex h-22 w-full flex-col items-center">
      <div className="absolute flex w-full flex-row justify-between px-8">
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            setMonth(Math.max(month - 1, 0));
          }}
        >
          <ArrowLeftCircle />
        </Button>
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            setMonth(Math.min(month + 1, 11));
          }}
        >
          <ArrowRightCircle />
        </Button>
      </div>
      <div className="faded-edges relative flex h-22 w-full flex-col items-center">
        <motion.div
          ref={ref}
          animate={{
            x: width / -24 - month * (width / 12),
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="absolute flex shrink-0 translate-x-1/2 flex-row"
        >
          {months.map((monthName, index) => (
            <TimelineStep
              key={monthName}
              month={monthName}
              monthNumber={index}
              isActive={index === month}
              onClick={() => {
                setMonth(index);
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
