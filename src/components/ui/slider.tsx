"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const sliderVariants = cva("", {
  variants: {
    variant: {
      default: "",
      eventDefault: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const trackVariants = cva(
  "relative h-1.5 w-full grow overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        eventDefault: "bg-[var(--event-primary-color)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const rangeVariants = cva("absolute h-full", {
  variants: {
    variant: {
      default: "bg-primary",
      eventDefault: "bg-[var(--event-primary-color)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const thumbVariants = cva(
  "block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary/50 bg-background focus-visible:ring-ring",
        eventDefault:
          "border-[var(--event-primary-color)]/50 bg-background focus-visible:ring-[var(--event-primary-color)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface SliderProps
  extends
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  variant?: "default" | "eventDefault";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className={trackVariants({ variant })}>
      <SliderPrimitive.Range className={rangeVariants({ variant })} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={thumbVariants({ variant })} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider, sliderVariants };
