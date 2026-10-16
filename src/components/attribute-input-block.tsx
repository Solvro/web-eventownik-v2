"use client";

import { ChevronRight, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { PublicBlock } from "@/types/blocks";

import { PublicBlockOccupants } from "./public-block-occupants";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroupItem } from "./ui/radio-group";

const valueOrZero = (value: number | null | undefined) => {
  return value === null || value === undefined ? "0" : value.toString();
};

/**
 * A single block entry card, being a radio group item.
 */
export function AttributeInputBlock({
  block,
  selectedBlockUuids,
  eventSlug,
  isMultiple,
  checked,
  onCheckedChange,
  disabled: disabledFromParent,
}: {
  block: PublicBlock;
  selectedBlockUuids?: string[];
  eventSlug?: string;
  isMultiple: boolean;
  /**
   * Only required when isMultiple is true
   */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Form");
  const [isOpen, setIsOpen] = useState(false);
  const isFull =
    block.capacity !== null && block.blockParticipantCount >= block.capacity;

  const isRegistered = selectedBlockUuids?.includes(block.uuid) ?? false;
  const hasParticipants = block.blockParticipantCount > 0;

  const isDisabled = disabledFromParent === true || (!isRegistered && isFull);

  return (
    <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
      <div className="flex items-start gap-4">
        {isMultiple ? (
          <Checkbox
            aria-label={block.name}
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={(innerChecked) =>
              onCheckedChange?.(innerChecked === true)
            }
          />
        ) : (
          <FormControl>
            <RadioGroupItem value={block.uuid} disabled={isDisabled} />
          </FormControl>
        )}
        <FormLabel className="flex grow">
          <div className="grid w-full grow grid-cols-[1fr_auto] items-start gap-4 font-semibold">
            <p
              lang="pl"
              className="min-w-0 text-lg leading-snug wrap-break-word"
            >
              {block.name}
            </p>
            <div className="flex flex-col items-end gap-1 text-right">
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isFull && "text-red-600",
                  isRegistered && "text-primary",
                )}
              >
                <Users className="size-4" />
                {block.capacity === null
                  ? valueOrZero(block.blockParticipantCount)
                  : `${valueOrZero(block.blockParticipantCount)}/${block.capacity.toString()}`}
              </div>
            </div>
          </div>
        </FormLabel>
      </div>
      {isRegistered ? (
        <p className="text-muted-foreground mb-0 text-sm leading-none whitespace-nowrap">
          {t("userRegisteredOnBlock")}
        </p>
      ) : null}
      <div className="mt-auto">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger
            className="text-primary flex w-full items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-90"
            disabled={!hasParticipants}
          >
            {t("participants")}
            <ChevronRight className="size-4 transition-transform" />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            {eventSlug === undefined ? (
              <p className="text-muted-foreground text-sm">
                {t("anonymousParticipantsList")}
              </p>
            ) : (
              <PublicBlockOccupants
                block={block}
                eventSlug={eventSlug}
                enabled={isOpen}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </FormItem>
  );
}
