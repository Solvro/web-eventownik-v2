"use client";

import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import type { Attribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { AttributeInputBlock } from "./attribute-input-block";
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
  attribute,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  userData: PublicParticipant;
  eventBlocks: PublicBlock[];
  attribute: Attribute;
}) {
  return (
    <div
      className={`mt-4 ${eventBlocks.length >= 3 ? "flex justify-center" : ""}`}
    >
      <RadioGroup
        onValueChange={field.onChange}
        defaultValue={String(field.value)}
        className={`mt-4 ${eventBlocks.length >= 3 ? "xl:min-w-xl xl:grid-cols-2" : ""}`}
      >
        <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
          <div className="flex items-center gap-4">
            <FormControl>
              <RadioGroupItem value={"null"} />
            </FormControl>
            <FormLabel>
              <p>Żaden</p>
            </FormLabel>
          </div>
          <span className="h-14">(zrezygnuj lub wypisz się)</span>
        </FormItem>
        {eventBlocks.map((childBlock) => (
          <AttributeInputBlock
            userData={userData}
            block={childBlock}
            key={childBlock.name}
            displayedAttributes={attribute.options ?? []}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
