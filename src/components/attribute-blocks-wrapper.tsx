"use client";

import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { AttributeInputBlock } from "./attribute-input-block";
import { Accordion } from "./ui/accordion";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

/**
 * This component wraps all block entries for a block type attribute.
 * It provides an accordion root element for block occupants accordion items.
 * It provides a radio group element for radio items within the blocks.
 */
export function AttributeBlocksWrapper({
  field,
  userData,
  eventBlocks,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  userData: PublicParticipant;
  eventBlocks: PublicBlock[];
}) {
  return (
    <Accordion type="multiple">
      <RadioGroup onValueChange={field.onChange} className="my-4 space-y-2">
        <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
          <div className="flex items-center gap-4">
            <FormControl>
              <RadioGroupItem value={"null"} />
            </FormControl>
            <FormLabel>
              <p>Żaden (zrezygnuj lub wypisz się)</p>
            </FormLabel>
          </div>
        </FormItem>
        {eventBlocks.map((childBlock) => (
          <AttributeInputBlock
            userData={userData}
            block={childBlock}
            key={childBlock.name}
          />
        ))}
      </RadioGroup>
    </Accordion>
  );
}
