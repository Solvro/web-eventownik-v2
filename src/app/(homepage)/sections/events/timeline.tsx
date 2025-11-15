"use client";

import { eachMonthOfInterval, getMonth, getYear } from "date-fns";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TimelineStep({
  month,
  monthIndex,
  isFirst,
  isLast,
  isActive,
  onClick,
}: {
  month: string;
  monthIndex: number;
  isFirst: boolean;
  isLast: boolean;
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
          <div className="flex flex-col items-center" key={index}>
            {/*monthNumber === 0 && index === 0 && (
              <p className="absolute -translate-y-6 text-sm">{year}</p>
            )*/}
            <span
              className={cn(
                "block",
                // Make the lines transparent if they are out of bounds
                (index < 5 && isFirst) || (index > 5 && isLast)
                  ? "bg-transparent"
                  : "bg-[#414141] dark:bg-[#d6d6d6]",
                // Full line for under the month
                index === 5
                  ? "h-10 w-px"
                  : // Remove the last line so they won't stack up
                    index === 10 && monthIndex !== 11
                    ? "w-0"
                    : "h-5 w-px",
              )}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Timeline({
  filters,
  setFilters,
}: {
  filters: { month: number; year: number };
  setFilters: ({ month, year }: { month: number; year: number }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Get the width of the timeline
  useLayoutEffect(() => {
    if (ref.current != null) {
      setWidth(ref.current.offsetWidth);
    }
  }, [ref]);

  const monthYears = eachMonthOfInterval({
    start: new Date(2025, 0, 1),
    end: new Date(getYear(new Date()) + 1, 11, 1),
  }).map((date) => {
    return {
      month: getMonth(date),
      year: getYear(date),
    };
  });

  return (
    <div className="relative flex h-22 w-full flex-col items-center">
      <div className="absolute flex w-full flex-row justify-between px-8">
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            if (filters.month === 0) {
              if (filters.year === 2025) {
                return;
              }
              setFilters({ month: 11, year: filters.year - 1 });
              return;
            }
            setFilters({ month: filters.month - 1, year: filters.year });
          }}
        >
          <ArrowLeftCircle />
        </Button>
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            if (filters.month === 11) {
              if (filters.year === getYear(new Date()) + 1) {
                return;
              }
              setFilters({ month: 0, year: filters.year + 1 });
              return;
            }
            setFilters({ month: filters.month + 1, year: filters.year });
          }}
        >
          <ArrowRightCircle />
        </Button>
      </div>
      <div className="faded-edges relative flex h-22 w-full flex-col items-center">
        <motion.div
          ref={ref}
          animate={{
            x:
              width / (-2 * monthYears.length) -
              monthYears.findIndex(
                (monthYear) =>
                  monthYear.month === filters.month &&
                  monthYear.year === filters.year,
              ) *
                (width / monthYears.length),
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="absolute flex shrink-0 translate-x-1/2 flex-row"
        >
          {monthYears.map(({ year, month }, index) => (
            <TimelineStep
              key={`${year.toString()}-${month.toString()}`}
              month={new Date(year, month, 1).toLocaleString("pl", {
                month: "long",
              })}
              isFirst={index === 0}
              isLast={index === monthYears.length - 1}
              monthIndex={index}
              isActive={year === filters.year && month === filters.month}
              onClick={() => {
                setFilters({ month, year });
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
