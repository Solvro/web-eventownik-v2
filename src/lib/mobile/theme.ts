import type { CSSProperties } from "react";

/**
 * Used when neither the app nor the event has a colour: the same blue the rest
 * of the site falls back to for an event without one.
 */
const DEFAULT_ACCENT = "#3672FD";
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** The event accent color, falling back to the design yellow for anything that is not a hex color. */
export function mobileAccent(primaryColor: string | null | undefined): string {
  return primaryColor !== null &&
    primaryColor !== undefined &&
    HEX_COLOR.test(primaryColor)
    ? primaryColor
    : DEFAULT_ACCENT;
}

function toRgb(hex: string): [number, number, number] {
  const value =
    hex.length === 4
      ? hex.slice(1).replaceAll(/[0-9a-f]/gi, (char) => char + char)
      : hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** White text is used on the accent whenever it reaches this contrast ratio */
const MIN_WHITE_CONTRAST = 3;

/**
 * Readable text colour on top of the accent. White is preferred on saturated
 * mid-tone colours (blues, reds, greens), where it looks right even though
 * dark text scores marginally higher; dark text is used only on light accents
 * such as the design yellow.
 */
export function mobileAccentForeground(accent: string): string {
  const contrastWhite = 1.05 / (luminance(toRgb(accent)) + 0.05);
  return contrastWhite >= MIN_WHITE_CONTRAST ? "#FFFFFF" : "#121212";
}

/**
 * Accent CSS variables for the mobile app wrapper; they are the same in light and dark.
 * The shadcn colour tokens for both themes live in the `.mobile-app` block of globals.css.
 */
export function mobileThemeStyle(
  primaryColor: string | null | undefined,
): CSSProperties {
  const accent = mobileAccent(primaryColor);
  const [r, g, b] = toRgb(accent);
  const foreground = mobileAccentForeground(accent);
  return {
    "--mobile-accent": accent,
    "--event-primary-color": accent,
    "--mobile-accent-foreground": foreground,
    "--mobile-accent-soft": `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.18)`,
    "--mobile-accent-glow": `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.5)`,
    "--mobile-accent-muted":
      foreground === "#121212"
        ? "rgba(18, 18, 18, 0.62)"
        : "rgba(255, 255, 255, 0.8)",
    "--mobile-danger": "#E5484D",
  } as CSSProperties;
}
