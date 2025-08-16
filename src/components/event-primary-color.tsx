"use client";

import { useEffect } from "react";

function getContrastColor(hex?: string) {
  if (hex == null) {
    return "var(--color-primary-foreground)";
  }
  // Remove hash if present
  hex = hex.replace(/^#/, "");
  // Parse r, g, b values
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "hsl(0 0% 9%)" : "hsl(0 0% 98%)";
}

export function setEventPrimaryColors(primaryColor?: string) {
  document.documentElement.style.setProperty(
    "--event-primary-color",
    primaryColor ?? "var(--color-primary)",
  );
  document.documentElement.style.setProperty(
    "--event-primary-foreground-color",
    getContrastColor(primaryColor),
  );
}

export function resetEventPrimaryColors() {
  document.documentElement.style.setProperty(
    "--event-primary-color",
    "var(--color-primary)",
  );
  document.documentElement.style.setProperty(
    "--event-primary-foreground-color",
    "var(--color-primary-foreground)",
  );
}

export function EventPrimaryColorSetter({
  primaryColor,
}: {
  primaryColor?: string;
}) {
  useEffect(() => {
    setEventPrimaryColors(primaryColor);
    return () => {
      resetEventPrimaryColors();
    };
  }, [primaryColor]);

  return null;
}
