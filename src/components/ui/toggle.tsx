import type React from "react";

interface ToggleProps {
  isOpen: boolean;
  toggle: () => void;
  className?: string;
}

export function Toggle({ isOpen, toggle, className }: ToggleProps) {
  return (
    <button
      onClick={toggle}
      className={`z-20 flex flex-col justify-center gap-1 p-4 ${className}`}
    >
      <span
        className={`h-0.5 w-6 rounded-md bg-primary-foreground transition ${
          isOpen ? "translate-y-[50%] rotate-45" : ""
        }`}
      />
      <span
        className={`h-0.5 w-6 rounded-md bg-primary-foreground transition ${
          isOpen ? "-translate-y-[260%] -rotate-45" : ""
        }`}
      />
    </button>
  );
}
