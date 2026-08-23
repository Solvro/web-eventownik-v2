"use client";

import { ChevronRight, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { Participant } from "@/types/participant";

import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";

const valueOrZero = (value: number | null | undefined) => {
  return value === null || value === undefined ? "0" : value.toString();
};

/**
 * A single block entry card, being a radio group item.
 */
export function AttributeInputBlock({
  block,
  // participants,
  isMultiple,
  checked,
  onCheckedChange,
  disabled: disabledFromParent,
}: {
  block: Block;
  // participants: Participant[];
  userData?: Participant;
  isMultiple: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  // console.log("participants:", participants);

  const t = useTranslations("Form");
  const isFull =
    block.capacity !== null &&
    (block.blockParticipantCount ?? 0) >= block.capacity;

  const isDisabled = disabledFromParent ?? isFull;

  return (
    <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
      <div className="flex items-start gap-4">
        {isMultiple ? (
          <Checkbox
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
      <div className="mt-auto">
        <Popover>
          <PopoverTrigger
            className="text-primary flex w-full items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-90"
            disabled={block.blockParticipantCount === 0}
          >
            {t("participants")}
            <ChevronRight className="size-4 transition-transform" />
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-2"
            align="center"
          >
            {block.blockParticipantCount === 0 ? (
              <p className="text-muted-foreground px-3 text-sm">
                {t("anonymousParticipantsList")}
              </p>
            ) : block.blockParticipantCount > 0 ? (
              <ScrollArea className="*:data-[slot='scroll-area-viewport']:max-h-64">
                <ul className="divide-border/60 space-y-0.5 px-1">
                  {/* {participants.map((occupant) => {
                    const isAnonymous =
                      occupant.name?.trim() === "" ||
                      occupant.name === undefined;
                    return (
                      <li
                        key={occupant.uuid}
                        className={cn(
                          "rounded-sm px-2 py-1.5 text-sm",
                          isAnonymous && "text-muted-foreground italic",
                        )}
                      >
                        {isAnonymous
                          ? t("anonymousParticipant")
                          : occupant.name}
                      </li>
                    );
                  })} */}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("noParticipants")}
              </p>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </FormItem>
  );
}
