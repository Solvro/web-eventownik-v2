import { Users } from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

/**
 * A temporary interface meant to represent block data returned from upcoming API endpoint.
 */
interface PublicBlock {
  name: string;
  description: string;
  capacity: number;
  occupants: string[] | number[];
}

/**
 * A single block entry card. Despite its name, it's not an input field.
 */
export function AttributeInputBlock({ block }: { block: PublicBlock }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-md border border-slate-500 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" /> {block.occupants.length} / {block.capacity}
      </div>
      <p className="text-3xl font-bold">{block.name}</p>
      <AccordionItem value={block.name} className="w-full">
        <AccordionTrigger className="text-primary [&>svg]:text-primary flex items-center gap-2">
          Uczestnicy
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2">
          {block.occupants.map((occupant) => (
            <div className="border-muted rounded-md border p-4" key={occupant}>
              <p>{occupant}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
