"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

function scrollToForm() {
  // Scroll to the right panel (form section) on mobile
  window.scrollTo({
    top: window.innerHeight,
    behavior: "smooth",
  });
}

export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide the indicator when user scrolls down
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition < 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToForm}
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden",
        "flex flex-col items-center gap-1",
        "bg-background/10 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md",
        "text-foreground dark:text-[#f0f0ff]",
        "cursor-pointer transition-all duration-300",
        "hover:bg-background/20 hover:scale-105",
        "focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
      )}
      aria-label="Scroll to form"
    >
      <span className="text-sm font-medium">Formularz</span>
      <ChevronDown className="size-8 animate-bounce" strokeWidth={2.5} />
    </button>
  );
}
