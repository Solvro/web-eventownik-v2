"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MarqueeLogo {
  src: string;
  /** Organization name, used as the image alt and tooltip content */
  name: string;
  href?: string;
}

interface LogoMarqueeProps {
  logos: MarqueeLogo[];
  /** Gap between logos in pixels */
  gap?: number;
  /** Seconds needed to scroll through one full set of logos */
  duration?: number;
  /** Duration used while the marquee is hovered (slows it down) */
  durationOnHover?: number;
  reverse?: boolean;
  className?: string;
}

function LogoItem({
  logo,
  hidden = false,
}: {
  logo: MarqueeLogo;
  hidden?: boolean;
}) {
  const image = (
    <Image
      src={logo.src}
      alt={hidden ? "" : logo.name}
      width={128}
      height={128}
      className="pointer-events-none size-18 shrink-0 rounded-full object-contain select-none md:size-22"
    />
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {logo.href === undefined ? (
          <span className="block rounded-full">{image}</span>
        ) : (
          <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            // The duplicated set is aria-hidden, so keep its links out of the tab order
            tabIndex={hidden ? -1 : undefined}
            className="focus-visible:ring-ring block rounded-full focus-visible:ring-2 focus-visible:outline-none"
          >
            {image}
          </a>
        )}
      </TooltipTrigger>
      <TooltipContent>{logo.name}</TooltipContent>
    </Tooltip>
  );
}

export function LogoMarquee({
  logos,
  gap = 48,
  duration = 10,
  durationOnHover = 20,
  reverse = false,
  className,
}: LogoMarqueeProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);

  // Changing the playback rate (instead of the duration) keeps the current
  // position, so the speed changes without the track jumping.
  const setPlaybackRate = (rate: number) => {
    for (const animation of trackRef.current?.getAnimations() ?? []) {
      animation.updatePlaybackRate(rate);
    }
  };

  if (prefersReducedMotion) {
    return (
      <ul
        className={cn("flex flex-wrap items-center justify-center", className)}
        style={{ gap: gap / 2 }}
      >
        {logos.map((logo) => (
          <li key={logo.src}>
            <LogoItem logo={logo} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden mask-[linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]",
        className,
      )}
    >
      {/* The keyframes live in globals.css. Each copy ends with a gap-sized
          padding, so shifting by -50% loops seamlessly. */}
      <div
        ref={trackRef}
        className="flex w-max items-center"
        style={{
          animationName: "logo-marquee",
          animationDuration: `${String(duration)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
        }}
        onPointerEnter={() => {
          setPlaybackRate(duration / durationOnHover);
        }}
        onPointerLeave={() => {
          setPlaybackRate(1);
        }}
      >
        <ul
          className="flex items-center"
          style={{ gap, paddingInlineEnd: gap }}
        >
          {logos.map((logo) => (
            <li key={logo.src}>
              <LogoItem logo={logo} />
            </li>
          ))}
        </ul>
        {/* Duplicate set for a seamless loop, hidden from assistive technology */}
        <ul
          aria-hidden
          className="flex items-center"
          style={{ gap, paddingInlineEnd: gap }}
        >
          {logos.map((logo) => (
            <li key={logo.src}>
              <LogoItem logo={logo} hidden />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
