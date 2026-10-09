"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Visual "required" marker, meant to be placed inside a field's label.
 *
 * It's hidden from assistive technologies and kept out of the tab order -
 * pair it with `required` (or `aria-required`) on the input itself,
 * which screen readers already announce.
 *
 * For controls that can't be marked as required natively (e.g. a group of
 * checkboxes or a canvas), set `announce` to add the tooltip text to the label
 * for screen readers instead.
 */
export function RequirementAsterisk({
  tooltip,
  announce = false,
  className,
}: {
  tooltip: string;
  announce?: boolean;
  className?: string;
}) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-hidden="true"
            className={cn("cursor-help text-red-500", className)}
          >
            *
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-(--radix-tooltip-content-available-width) text-wrap"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
      {announce ? <span className="sr-only">{tooltip}</span> : null}
    </>
  );
}
