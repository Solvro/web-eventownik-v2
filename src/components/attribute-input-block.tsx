"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";

import { getBlockParticipants } from "@/app/[eventSlug]/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

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
  isMultiple,
  checked,
  onCheckedChange,
  disabled: disabledFromParent,
}: {
  block: Block;
  userData?: PublicParticipant;
  isMultiple: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Form");
  const isFull =
    block.capacity !== null &&
    (block.blockParticipantCount ?? 0) >= block.capacity;

  const isDisabled = disabledFromParent ?? isFull;

  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [isParticipantsListOpen, setIsParticipantsListOpen] = useState(false);
  const hasParticipants = (block.blockParticipantCount ?? 0) > 0;
  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    // The key is hashed by value, so it changes only when the polled block data does
    queryKey: ["block-participants", eventSlug, block],
    queryFn: async () => getBlockParticipants(eventSlug, block),
    enabled: isParticipantsListOpen && hasParticipants,
  });
  const isAnonymousList =
    participants != null &&
    participants.length > 0 &&
    participants.every((participant) => participant.name.trim() === "");

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
        <Popover
          open={isParticipantsListOpen}
          onOpenChange={setIsParticipantsListOpen}
        >
          <PopoverTrigger
            className="text-primary flex w-full items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-90"
            disabled={!hasParticipants}
          >
            {t("participants")}
            <ChevronRight className="size-4 transition-transform" />
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-2"
            align="center"
          >
            {isLoadingParticipants ? (
              <Loader2 className="text-muted-foreground mx-auto size-4 animate-spin" />
            ) : isAnonymousList ? (
              <p className="text-muted-foreground px-3 text-sm">
                {t("anonymousParticipantsList")}
              </p>
            ) : participants != null && participants.length > 0 ? (
              <ScrollArea className="*:data-[slot='scroll-area-viewport']:max-h-64">
                <ul className="divide-border/60 space-y-0.5 px-1">
                  {participants.map((occupant, index) => {
                    const isAnonymous = occupant.name.trim() === "";
                    return (
                      <li
                        // Occupants have no identifier, only the values of the participant fields
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
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
                  })}
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
