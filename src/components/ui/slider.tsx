"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[var(--event-primary-color)]/20">
      <SliderPrimitive.Range className="absolute h-full bg-[var(--event-primary-color)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border border-[var(--event-primary-color)]/50 shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        "hover:after:bg-background hover:after:absolute hover:after:top-[50%] hover:after:left-[50%] hover:after:grid hover:after:size-8 hover:after:translate-x-[-50%] hover:after:translate-y-[-170%] hover:after:place-items-center hover:after:rounded-full hover:after:text-sm hover:after:content-[attr(aria-valuenow)]",
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
