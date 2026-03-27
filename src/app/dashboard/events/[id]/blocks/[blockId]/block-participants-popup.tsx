"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { BlockParticipant } from "@/types/blocks";

function BlockParticipantsPopup({
  participants,
}: {
  participants: BlockParticipant[];
}) {
  const t = useTranslations("Form");
  return (
    <Popover>
      <Button asChild variant="ghost" size="icon">
        <PopoverTrigger
          className="flex items-center gap-2 text-sm"
          disabled={participants.length === 0}
          aria-label={t("participants")}
        >
          <Users className="size-4" />
        </PopoverTrigger>
      </Button>

      <PopoverContent className="w-full max-w-64 min-w-fit p-2" align="center">
        {participants.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("noParticipants")}</p>
        ) : (
          <ScrollArea className="*:data-[slot='scroll-area-viewport']:max-h-64">
            <ul className="divide-border/60 space-y-0.5 px-1">
              {participants.map((occupant) => {
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
                    {isAnonymous ? t("anonymousParticipant") : occupant.name}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { BlockParticipantsPopup };
