import { Check, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Native radio and checkbox inputs styled like the Radix-based `RadioGroupItem`
 * and `Checkbox`. Use them when Radix's behavior gets in the way:
 * - `RadioGroup` only lets keyboard focus in through its root element and
 *   redirects it to the checked radio, which breaks tab order when other
 *   focusable elements (e.g. buttons) sit between the radios
 * - Inside a <form>, Radix renders a hidden, unlabelled native input next to
 *   each control, which accessibility checkers report as a missing form label
 *
 * Props (including `id` and ARIA attributes from `FormControl`) go to the
 * <input>, `className` goes to the wrapper.
 */

type NativeChoiceProps = Omit<React.ComponentPropsWithoutRef<"input">, "type">;

const inputClassName =
  "peer focus-visible:ring-ring col-start-1 row-start-1 size-4 cursor-pointer appearance-none border border-(--event-primary-color) focus-visible:ring-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50";

const NativeRadio = React.forwardRef<HTMLInputElement, NativeChoiceProps>(
  ({ className, ...props }, ref) => (
    <span className={cn("grid size-4 shrink-0", className)}>
      <input
        ref={ref}
        type="radio"
        className={cn(inputClassName, "rounded-full shadow")}
        {...props}
      />
      <Circle className="pointer-events-none invisible col-start-1 row-start-1 size-3.5 place-self-center fill-(--event-primary-color) text-(--event-primary-color) peer-checked:visible peer-disabled:opacity-50" />
    </span>
  ),
);
NativeRadio.displayName = "NativeRadio";

const NativeCheckbox = React.forwardRef<HTMLInputElement, NativeChoiceProps>(
  ({ className, ...props }, ref) => (
    <span className={cn("grid size-4 shrink-0", className)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          inputClassName,
          "rounded-sm shadow-sm checked:bg-(--event-primary-color)",
        )}
        {...props}
      />
      <Check className="pointer-events-none invisible col-start-1 row-start-1 size-4 text-(--event-primary-foreground-color) peer-checked:visible peer-disabled:opacity-50" />
    </span>
  ),
);
NativeCheckbox.displayName = "NativeCheckbox";

export { NativeRadio, NativeCheckbox };
