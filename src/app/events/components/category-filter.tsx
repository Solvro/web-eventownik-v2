"use client";

import { LayoutGroup, motion } from "motion/react";

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
  return (
    <div className="flex justify-center">
      <div className="scrollbar-hide flex flex-row items-center gap-2 overflow-x-auto rounded-full bg-white/60 p-2 shadow-lg backdrop-blur-sm dark:bg-white/10">
        <LayoutGroup>
          {["all", ...EVENT_CATEGORIES].map((category) => (
            <button
              key={category}
              onClick={() => {
                onCategoryChange(category as EventCategory | "all");
              }}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                selectedCategory === category
                  ? "text-white"
                  : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10",
              )}
            >
              {selectedCategory === category ? (
                <motion.div
                  layoutId="category-pill-bg"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4473E1] to-[#5a8cff]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">
                {CATEGORY_LABELS[category as EventCategory | "all"]}
              </span>
            </button>
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
}
