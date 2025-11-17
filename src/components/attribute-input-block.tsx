"use client";

import { ChevronRight, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

// import { Button } from "./ui/button";
import { FormControl, FormItem, FormLabel } from "./ui/form";
// import { cn } from "@/lib/utils";
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
  displayedAttributes,
}: {
  block: PublicBlock;
  userData: PublicParticipant;
  displayedAttributes: string[];
}) {
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
            <p lang="pl" className="min-w-0 text-lg leading-snug break-words">
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
          Jesteś już na tej liście
        </p>
      ) : null}
      <div className="mt-auto">
        <Popover>
          <PopoverTrigger
            className="text-primary flex w-full items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-90"
            disabled={block.meta.participants.length === 0}
          >
            Uczestnicy
            <ChevronRight className="size-4 transition-transform" />
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-2"
            align="center"
          >
            {block.meta.participants.length === 0 ? (
              <p className="text-muted-foreground text-sm">Brak uczestników</p>
            ) : (
              <ScrollArea className="[&_[data-slot=scroll-area-viewport]]:max-h-64">
                <ul className="divide-border/60 -mx-1 space-y-0.5 px-1">
                  {block.meta.participants.map((occupant) => (
                    <li
                      key={occupant.id}
                      className="rounded-sm px-2 py-1.5 text-sm"
                    >
                      {occupant.name.toString().trim()
                        ? `${occupant.name.toString()}${
                            displayedAttributes.includes("email")
                              ? ` (${occupant.email.toString()})`
                              : ""
                          }`
                        : displayedAttributes.includes("email")
                          ? occupant.email
                          : "Anonimowy uczestnik"}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </FormItem>
  );
}

//   WERSJA KAFELKOWA
//   return (
//     <div className="flex flex-col items-center gap-6 rounded-md border border-slate-500 p-4">
//       <div
//         className={cn(
//           "flex items-center gap-2 text-sm font-semibold",
//           isFull ? "text-red-600" : "",
//         )}
//       >
//         <Users className="size-4" /> {block.occupants.length} / {block.capacity}
//       </div>
//       <p className="text-3xl font-bold">{block.name}</p>
//       <Button
//         disabled={!isRegistered && isFull}
//         variant={isRegistered ? "outline" : "default"}
//         type="button"
//       >
//         {isRegistered ? "Opuść" : "Dołącz"}
//       </Button>
//       <AccordionItem value={block.name} className="w-full">
//         <AccordionTrigger className="text-primary [&>svg]:text-primary flex items-center gap-2">
//           Uczestnicy
//         </AccordionTrigger>
//         <AccordionContent className="flex flex-col gap-2">
//           {block.occupants.map((occupant) => (
//             <div
//               className="border-muted rounded-md border p-4"
//               key={occupant.participantSlug}
//             >
//               <p>{occupant.identity}</p>
//             </div>
//           ))}
//         </AccordionContent>
//       </AccordionItem>
//     </div>
//   );
// }
