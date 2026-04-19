"use client";

import { ChevronRight, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { AttributeOption } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
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
  userData,
}: {
  block: PublicBlock;
  userData: PublicParticipant;
  displayedAttributes?: AttributeOption[];
}) {
  const t = useTranslations("Form");
  const isFull =
    block.capacity !== null && block.meta.participants.length >= block.capacity;
  const isRegistered = userData.attributes.some(
    (attribute) =>
      attribute.type === "block" &&
      attribute.meta.pivot_value === block.id.toString(),
  );

  return (
    <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
      <div className="flex items-start gap-4">
        <FormControl>
          <RadioGroupItem
            value={block.id.toString()}
            disabled={!isRegistered && isFull}
          />
        </FormControl>
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
                  ? valueOrZero(block.meta.participantsInBlockCount)
                  : `${valueOrZero(block.meta.participantsInBlockCount)}/${block.capacity.toString()}`}
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
        <Popover>
          <PopoverTrigger
            className="text-primary flex w-full items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-90"
            disabled={block.meta.participants.length === 0}
          >
            {t("participants")}
            <ChevronRight className="size-4 transition-transform" />
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-2"
            align="center"
          >
            {block.meta.participants.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("noParticipants")}
              </p>
            ) : (
              <ScrollArea className="[&>[data-slot='scroll-area-viewport']]:max-h-64">
                <ul className="divide-border/60 space-y-0.5 px-1">
                  {block.meta.participants.map((occupant) => {
                    const isAnonymous =
                      occupant.name === "" || occupant.name === undefined;
                    return (
                      <li
                        key={occupant.id}
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
            )}
          </PopoverContent>
        </Popover>
      </div>
    </FormItem>
  );
}
