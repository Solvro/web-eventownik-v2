"use client";

import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { AttributeInputBlock } from "./attribute-input-block";
import { Accordion } from "./ui/accordion";
import { RadioGroup } from "./ui/radio-group";

const MOCK_DATA = [
  {
    id: 1,
    name: "Pokój 12",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 5,
    occupants: [
      {
        identity: "lalal@lorem.com",
        participantSlug: "e6f6dde2-8692-4872-a620-016b5b9a0037",
      },
      {
        identity: "jane.doe@example.com",
        participantSlug: "e6f6dde2-8692-asdz-a620-016b5b9a0037",
      },
      {
        identity: "student.pwr@example.com",
        participantSlug: "e6f6dde2-1234-4872-a620-016b5b9a0037",
      },
    ],
  },
  {
    id: 2,
    name: "Pokój 13",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 5,
    occupants: [
      {
        identity: "lorem12@example.com",
        participantSlug: "asdadasd-5dsa-4872-a620-016b5b9a0037",
      },
      {
        identity: "foo@example.com",
        participantSlug: "asdadasd-8692-4872-a620-zxczcxz",
      },
      {
        identity: "loremipsum.pwr@example.com",
        participantSlug: "asdadasd-errer3344-4872-a620-016b5b9a0037",
      },
      {
        identity: "foo.bar@baz.com",
        participantSlug: "asdadasd-1234-asdh67887-a620-016b5b9a0037",
      },
    ],
  },
  {
    id: 15,
    name: "Pokój 14",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 20,
    occupants: [
      {
        identity: "lorem12@example.com",
        participantSlug: "asdadasd-5dsa-4872-a620-016b5b9a0037",
      },
      {
        identity: "foo@example.com",
        participantSlug: "asdadasd-8692-4872-a620-zxczcxz",
      },
      {
        identity: "loremipsum.pwr@example.com",
        participantSlug: "asdadasd-errer3344-4872-a620-016b5b9a0037",
      },
    ],
  },
  {
    id: 3,
    name: "Pokój 15",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 2,
    occupants: [
      {
        identity: "lorem12@example.com",
        participantSlug: "asdadasd-5dsa-4872-a620-016b5b9a0037",
      },
      {
        identity: "foo@example.com",
        participantSlug: "asdadasd-8692-4872-a620-zxczcxz",
      },
    ],
  },
];

/**
 * This component wraps all block entries for a block type attribute.
 * It provides an accordion root element for block occupants accordion items.
 * It provides a radio group element for radio items within the blocks.
 */
// TODO: Should receive the data instead of mocking
export function AttributeBlocksWrapper({
  field,
}: {
  field: ControllerRenderProps<FieldValues, string>;
}) {
  return (
    <Accordion type="multiple">
      <RadioGroup onValueChange={field.onChange} className="my-4 space-y-2">
        {MOCK_DATA.map((block) => (
          <AttributeInputBlock block={block} key={block.name} />
        ))}
      </RadioGroup>
    </Accordion>
  );
}
