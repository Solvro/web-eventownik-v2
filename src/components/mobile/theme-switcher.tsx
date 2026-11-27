"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", label: "Systemowy" },
  { value: "light", label: "Jasny" },
  { value: "dark", label: "Ciemny" },
] as const;

function noop() {
  // Nothing to clean up
}

function subscribeToNothing() {
  return noop;
}

/** Theme choice for the whole site, shown on the Profil screen */
export function MobileThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client; render no selection until hydrated
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const current = hydrated ? (theme ?? "system") : null;

  return (
    <div className="bg-card flex flex-col gap-3 rounded-3xl p-5">
      <span id="mobile-theme-label" className="text-base font-semibold">
        Motyw
      </span>
      <div
        role="radiogroup"
        aria-labelledby="mobile-theme-label"
        className="bg-secondary grid grid-cols-3 gap-1 rounded-3xl p-1"
      >
        {OPTIONS.map((option) => {
          const selected = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "h-10 rounded-[20px] text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)] focus-visible:outline-none",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground active:bg-border",
              )}
              onClick={() => {
                setTheme(option.value);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
