"use client";

import { AttributeInputBlock } from "./attribute-input-block";
import { Accordion } from "./ui/accordion";

const MOCK_DATA = [
  {
    name: "Pokój 12",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 5,
    occupants: [
      "john.doe@example.com",
      "jane.doe@example.com",
      "student.pwr@example.com",
      "jan.kowalski@example.com",
    ],
  },
  {
    name: "Pokój 13",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    capacity: 5,
    occupants: [
      "lorem12@example.com",
      "foo@example.com",
      "loremipsum.pwr@example.com",
      "foo.bar@baz.com",
    ],
  },
];

/**
 * This component wraps all block entries for a block type attribute.
 * It provides an accordion root element for block occupants accordion items.
 */
// TODO: Should receive the data instead of mocking
export function AttributeBlocksWrapper() {
  return (
    <Accordion type="multiple" className="my-4 space-y-6">
      {MOCK_DATA.map((block) => (
        <AttributeInputBlock block={block} key={block.name} />
      ))}
    </Accordion>
  );
}
