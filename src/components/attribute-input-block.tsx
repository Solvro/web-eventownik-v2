"use client";

import { Users } from "lucide-react";

import { cn } from "@/lib/utils";

// import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
// import { Button } from "./ui/button";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { RadioGroupItem } from "./ui/radio-group";

/**
 * A temporary interface meant to represent block data returned from upcoming API endpoint.
 */
interface PublicBlock {
  id: number;
  name: string;
  description: string;
  capacity: number;
  occupants: Record<"identity" | "participantSlug", string>[];
}

// Temporary participant slug. Used for registering to a given block. Adjust according to testing needs.
const PARTICIPANT_SLUG = "e6f6dde2-8692-4872-a620-016b5b9a0037";

/**
 * A single block entry card, being a radio group item.
 */
export function AttributeInputBlock({ block }: { block: PublicBlock }) {
  const isFull = block.occupants.length >= block.capacity;
  const isRegistered = block.occupants.some(
    (occupant) => occupant.participantSlug === PARTICIPANT_SLUG,
  );

  return (
    <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
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
              <Users className="size-4" /> {block.occupants.length} /{" "}
              {block.capacity}
            </div>
          </div>
        </FormLabel>
      </div>
      <AccordionItem value={block.name} className="w-full">
        <AccordionTrigger className="text-primary [&>svg]:text-primary flex items-center gap-2 pb-2">
          Uczestnicy
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          {block.occupants.map((occupant) => (
            <div
              className="border-muted rounded-md border p-4"
              key={occupant.participantSlug}
            >
              <p>{occupant.identity}</p>
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
