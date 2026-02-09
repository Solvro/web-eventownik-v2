"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { EventAttributesFormSchema } from "./attributes/schema";
import { SortableAttributeItem } from "./attributes/sortable-attribute-item";
import type { NewEventAttribute } from "./attributes/types";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export { EventAttributesFormSchema } from "./attributes/schema";
export type { NewEventAttribute } from "./attributes/types";

interface AttributesFormProps {
  onAdd?: (attribute: NewEventAttribute) => void;
  onUpdate?: (index: number, attribute: NewEventAttribute) => void;
  onRemove?: (index: number, attribute: NewEventAttribute) => void;
}

export function AttributesForm({
  onAdd,
  onUpdate,
  onRemove,
}: AttributesFormProps = {}) {
  const { control, watch, getValues, setValue } =
    useFormContext<z.infer<typeof EventAttributesFormSchema>>();

  const { fields, append, remove, move } = useFieldArray({
    name: "attributes",
    control,
  });

  const attributes = watch("attributes");
  const [newAttributeName, setNewAttributeName] = useState("");

  const attributeSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddAttribute = () => {
    const label = newAttributeName.trim();
    if (!label) {
      return;
    }

    const newAttribute: NewEventAttribute = {
      name: label,
      type: "text",
      slug: crypto.randomUUID(),
      options: [],
      showInList: true,
      order: fields.length,
      isSensitiveData: false,
      reason: null,
    };

    append(newAttribute);
    onAdd?.(newAttribute);
    setNewAttributeName("");
  };

  const handleAttributeDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    move(oldIndex, newIndex);

    const reorderedAttributes = getValues("attributes");
    for (const [index, attribute] of reorderedAttributes.entries()) {
      setValue(`attributes.${index}.order`, index);
      onUpdate?.(index, { ...attribute, order: index });
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-none font-medium">Atrybuty</p>
        <p className="text-muted-foreground text-sm leading-none font-medium">
          Dodane atrybuty będzie można wykorzystać w np. formularzu
          rejestracyjnym.
        </p>
      </div>

      <DndContext
        sensors={attributeSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleAttributeDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((attribute, index) => (
              <SortableAttributeItem
                key={attribute.id}
                id={attribute.id}
                attribute={attribute}
                index={index}
                onUpdateItem={(index_, value) => {
                  onUpdate?.(index_, value);
                }}
                onRemove={() => {
                  const removedAttribute = attributes[index];
                  remove(index);
                  onRemove?.(index, removedAttribute);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          value={newAttributeName}
          onChange={(event_) => {
            setNewAttributeName(event_.target.value);
          }}
          placeholder="Nazwa nowego atrybutu"
          className="flex-1"
          onKeyDown={(event_) => {
            if (event_.key === "Enter") {
              event_.preventDefault();
              handleAddAttribute();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2 sm:w-auto"
          onClick={handleAddAttribute}
          disabled={newAttributeName.trim().length === 0}
        >
          <PlusIcon className="h-4 w-4" />
          Dodaj
        </Button>
      </div>
    </div>
  );
}
