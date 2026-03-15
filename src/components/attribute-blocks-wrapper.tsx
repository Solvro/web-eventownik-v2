"use client";

import { useDebouncedState } from "@tanstack/react-pacer/debouncer";
import { useTranslations } from "next-intl";
import { Activity, useState } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { AttributeInputBlock } from "./attribute-input-block";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

function includeBlock(
  block: PublicBlock,
  searchText: string,
  hideFullBlocks: boolean,
): boolean {
  const doesBlockIncludeSearchText =
    searchText === "" ||
    block.name.toLowerCase().includes(searchText.toLowerCase());
  const isBlockNotFull =
    !hideFullBlocks ||
    block.capacity === null ||
    (block.meta.participantsInBlockCount ?? 0) < block.capacity;
  return doesBlockIncludeSearchText && isBlockNotFull;
}

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
  const t = useTranslations("Form");
  const [searchText, setSearchText] = useDebouncedState("", {
    wait: 200,
  });
  const [hideFullBlocks, setHideFullBlocks] = useState(false);

  const sortedBlocks = eventBlocks.toSorted((a, b) => a.order - b.order);

  const filteredBlocks = sortedBlocks.filter((block) =>
    includeBlock(block, searchText, hideFullBlocks),
  );
  return (
    <div
      className={cn(
        "mt-4",
        eventBlocks.length >= 3 && "flex flex-col items-center justify-center",
      )}
    >
      {eventBlocks.length >= 5 && (
        <FieldGroup className="mb-2 gap-2">
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <Field>
              <Input
                aria-label={t("searchBlocksLabel")}
                onChange={(event) => {
                  setSearchText(event.target.value.trim());
                }}
                placeholder={t("searchBlocksPlaceholder")}
              />
            </Field>
            <Field orientation="horizontal" className="w-min">
              <Checkbox
                id="hide-full-checkbox"
                name="hide-full-checkbox"
                checked={hideFullBlocks}
                onCheckedChange={(checked) => {
                  setHideFullBlocks(checked === true);
                }}
              />
              <FieldLabel
                htmlFor="hide-full-checkbox"
                className="whitespace-nowrap"
              >
                {t("hideFullBlocks")}
              </FieldLabel>
            </Field>
          </div>
          <Activity mode={filteredBlocks.length === 0 ? "visible" : "hidden"}>
            <p className="text-muted-foreground text-sm font-normal">
              {t("noBlocksFound")}
            </p>
          </Activity>
        </FieldGroup>
      )}
      <RadioGroup
        onValueChange={field.onChange}
        defaultValue={String(field.value)}
        className={cn(
          "mt-4",
          eventBlocks.length >= 3 && "w-full xl:min-w-xl xl:grid-cols-2",
        )}
      >
        <Activity
          mode={
            filteredBlocks.length === eventBlocks.length ? "visible" : "hidden"
          }
        >
          <FormItem className="flex flex-col rounded-md border border-slate-500 p-4 [&>button:first-of-type]:m-0">
            <div className="flex items-center gap-4">
              <FormControl>
                <RadioGroupItem value={"null"} />
              </FormControl>
              <FormLabel>
                <p>{t("noBlockOption")}</p>
              </FormLabel>
            </div>
            <span className="h-14">{t("noBlockOptionDescription")}</span>
          </FormItem>
        </Activity>
        {filteredBlocks.map((childBlock) => (
          <AttributeInputBlock
            userData={userData}
            block={childBlock}
            key={childBlock.id}
            displayedAttributes={attribute.options ?? []}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
