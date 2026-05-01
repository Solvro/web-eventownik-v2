"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types/categories";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/types/categories";

interface CategoryFilterProps {
  selectedCategory: EventCategory | "all";
  onCategoryChange: (category: EventCategory | "all") => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { ref: leftSentinelRef, inView: leftSentinelInView } = useInView({
    root: scrollContainerRef.current,
    threshold: 0,
  });

  const { ref: rightSentinelRef, inView: rightSentinelInView } = useInView({
    root: scrollContainerRef.current,
    threshold: 0,
  });

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container !== null) {
      const scrollAmount = container.clientWidth * 0.7;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const showLeftArrow = !leftSentinelInView;
  const showRightArrow = !rightSentinelInView;

  return (
    <div className="flex justify-center">
      <div className="group relative flex w-full max-w-fit items-center p-1">
        <AnimatePresence>
          {showLeftArrow ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                scroll("left");
              }}
              className="text-foreground absolute left-1 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </motion.button>
          ) : null}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          className="scrollbar-hidden flex flex-row overflow-x-auto rounded-full p-1"
        >
          <div ref={leftSentinelRef} className="relative left-8 size-px" />
          <div className="flex flex-row items-center gap-2">
            <LayoutGroup>
              {["all", ...EVENT_CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category as EventCategory | "all");
                  }}
                  className={cn(
                    "focus-visible:ring-primary/50 relative shrink-0 rounded-full px-6 py-3 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:outline-none",
                    selectedCategory === category
                      ? "text-white"
                      : "border border-[#e6e6e6] bg-white text-black hover:bg-gray-50 dark:border-[#1e2a3a] dark:bg-[#111827] dark:text-white dark:hover:bg-[#1a2438]",
                  )}
                >
                  {selectedCategory === category ? (
                    <motion.div
                      layoutId="category-pill-bg"
                      className="absolute inset-0 rounded-full bg-[#1a294a]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    {CATEGORY_LABELS[category as EventCategory | "all"]}
                  </span>
                </button>
              ))}
            </LayoutGroup>
          </div>
          <div ref={rightSentinelRef} className="relative right-8 size-px" />
        </div>

        <AnimatePresence>
          {showRightArrow ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                scroll("right");
              }}
              className="text-foreground absolute right-1 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
