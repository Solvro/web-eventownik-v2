import type { CSSProperties } from "react";

/** Design yellow from the Figma mobile app, used when the event has no primary colour. */
const DEFAULT_ACCENT = "#F9D574";
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

/** Readable text colour on top of the accent: dark on light accents, white on dark ones. */
export function mobileAccentForeground(accent: string): string {
  const l = luminance(toRgb(accent));
  const contrastWhite = 1.05 / (l + 0.05);
  const contrastDark = (l + 0.05) / (luminance(toRgb("#121212")) + 0.05);
  return contrastDark >= contrastWhite ? "#121212" : "#FFFFFF";
}

/**
 * CSS variables for the mobile app wrapper. The app is light-only like the design,
 * so the shadcn tokens are pinned to light values here too.
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
    "--background": "#FFFFFF",
    "--foreground": "#121212",
    "--card": "#F8F8F8",
    "--card-foreground": "#121212",
    "--popover": "#FFFFFF",
    "--popover-foreground": "#121212",
    "--primary": "#121212",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#F4F4F4",
    "--secondary-foreground": "#121212",
    "--muted": "#F4F4F4",
    "--muted-foreground": "#6F6F6F",
    "--accent": "#F4F4F4",
    "--accent-foreground": "#121212",
    "--destructive": "#E5484D",
    "--border": "#E7E7E7",
    "--input": "#E4E4E4",
    "--ring": "#121212",
  } as CSSProperties;
}
