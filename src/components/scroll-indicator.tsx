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
  const [shouldRender, setShouldRender] = useState(true);

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

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay unmounting to allow fade-out animation to complete
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <button
      onClick={scrollToForm}
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden",
        "flex flex-col items-center gap-1",
        "bg-background/70 rounded-lg px-4 py-3 shadow-lg backdrop-blur-md",
        "text-foreground dark:text-[#f0f0ff]",
        "cursor-pointer transition-all duration-300",
        "hover:bg-background/85 hover:scale-105",
        "focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
        isVisible
          ? "animate-fade-in opacity-100"
          : "animate-fade-out opacity-0",
      )}
      aria-label="Scroll to form"
    >
      <span className="text-sm font-medium">Formularz</span>
      <ChevronDown className="animate-subtle-bounce size-8" strokeWidth={2.5} />
    </button>
  );
}
