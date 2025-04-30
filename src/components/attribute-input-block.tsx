"use client";

import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

// import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
// import { Button } from "./ui/button";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { RadioGroupItem } from "./ui/radio-group";

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
    <FormItem className="flex h-fit flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
      <div className="flex items-center gap-4">
        <FormControl>
          <RadioGroupItem
            value={block.id.toString()}
            disabled={!isRegistered && isFull}
          />
        </FormControl>
        <FormLabel className="flex grow justify-between">
          <div className="flex grow items-center justify-between font-semibold">
            <p className="text-lg">{block.name}</p>
            {isRegistered ? (
              <p className="text-muted text-sm">Jesteś już na liście</p>
            ) : null}
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
        </FormLabel>
      </div>
      <AccordionItem value={block.name} className="w-full">
        <AccordionTrigger
          className="text-primary [&>svg]:text-primary flex items-center gap-2 pb-2"
          disabled={block.meta.participants.length === 0}
        >
          Uczestnicy
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          {block.meta.participants.map((occupant) => (
            <div
              className="border-muted rounded-md border p-4"
              key={occupant.id}
            >
              {/* TODO: Implement other kinds of identifiers */}
              <p>
                {occupant.name.toString().trim()
                  ? `${occupant.name.toString()}${
                      displayedAttributes.includes("email")
                        ? ` (${occupant.email.toString()})`
                        : ""
                    }`
                  : displayedAttributes.includes("email")
                    ? occupant.email
                    : "Anonimowy uczestnik"}
              </p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
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
