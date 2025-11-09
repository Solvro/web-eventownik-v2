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
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

import { ATTRIBUTE_TYPES } from "@/app/dashboard/events/[id]/settings/tabs/attributes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SLUG_REGEX } from "@/lib/utils";
import type { AttributeType, EventAttribute } from "@/types/attributes";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export const EventAttributesFormSchema = z.object({
  attributes: z.array(z.custom<EventAttribute>()),
});

interface AttributeItemProps {
  attribute: EventAttribute;
  index: number;
  onRemove: () => void;
}

interface SortableOptionProps {
  option: string;
  onRemove: (option: string) => void;
}

function SortableOption({ option, onRemove }: SortableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: option,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 rounded border-2 px-2 py-1 text-sm"
    >
      <span className="cursor-move" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </span>
      {option}
      <button
        onClick={() => {
          onRemove(option);
        }}
        className="text-destructive"
      >
        ×
      </button>
    </div>
  );
}
SortableOption.displayName = "SortableOption";

const AttributeTypeOptions = () =>
  ATTRIBUTE_TYPES.map((type) => (
    <Tooltip key={type.value}>
      <TooltipTrigger asChild>
        <SelectItem value={type.value}>
          <div className="flex items-center gap-2">
            {type.icon}
            <span className="overflow-x-hidden text-ellipsis">
              {type.title}
            </span>
          </div>
        </SelectItem>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{type.description ?? type.title}</p>
      </TooltipContent>
    </Tooltip>
  ));

function AttributeItem({ attribute, index, onRemove }: AttributeItemProps) {
  const { register, formState, setValue, getValues } =
    useFormContext<z.infer<typeof EventAttributesFormSchema>>();
  const [optionsInput, setOptionsInput] = useState("");
  const [slugError, setSlugError] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over != null && active.id !== over.id) {
      const oldOptions = getValues(`attributes.${index}.options`);
      const oldIndex = oldOptions?.indexOf(active.id.toString()) ?? -1;
      const newIndex = oldOptions?.indexOf(over.id.toString()) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1 && oldOptions != null) {
        const newOptions = arrayMove(oldOptions, oldIndex, newIndex);
        setValue(`attributes.${index}.options`, newOptions);
      }
    }
  };

  const addOption = () => {
    const trimmedValue = optionsInput.trim();
    const oldOptions = getValues(`attributes.${index}.options`);
    if (trimmedValue) {
      const exists = oldOptions?.includes(trimmedValue) ?? false;
      if (!exists) {
        const newOptions = [...(oldOptions ?? []), trimmedValue];
        setValue(`attributes.${index}.options`, newOptions);
        setOptionsInput("");
      }
    }
  };

  const handleSlugChange = (value: string) => {
    if (!SLUG_REGEX.test(value)) {
      setSlugError("Slug może zawierać tylko małe litery, cyfry i myślniki");
    } else if (value.length < 3) {
      setSlugError("Slug musi mieć co najmniej 3 znaki");
    } else {
      setSlugError("");
    }
    setValue(`attributes.${index}.slug`, value);
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setValue(
      `attributes.${index}.options`,
      getValues(`attributes.${index}.options`)?.filter(
        (o) => o !== optionToRemove,
      ) ?? [],
    );
  };

  return (
    <div className="mb-2 flex gap-2 rounded-lg p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-foreground my-2 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            defaultValue={attribute.name}
            {...register(`attributes.${index}.name` as const)}
            disabled={formState.isSubmitting}
            placeholder="Attribute label"
            className="flex-1"
          />

          <Select
            defaultValue={attribute.type}
            onValueChange={(value: AttributeType) => {
              setValue(`attributes.${index}.type`, value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <AttributeTypeOptions />
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-2">
            <Input
              defaultValue={attribute.slug ?? ""}
              onChange={(event_) => {
                handleSlugChange(event_.target.value);
              }}
              disabled={formState.isSubmitting}
              placeholder="slug"
              className={`flex-1 ${slugError ? "border-destructive" : ""}`}
            />
            {slugError ? (
              <span className="text-destructive text-sm">{slugError}</span>
            ) : null}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`showInTable-${attribute.id.toString()}`}
              onCheckedChange={(checked) => {
                setValue(`attributes.${index}.showInList`, checked === true);
              }}
              defaultChecked={true}
            />
            <Label htmlFor={`showInTable-${attribute.id.toString()}`}>
              Pokaż w tabeli
            </Label>
          </div>
        </div>

        {(getValues(`attributes.${index}.type`) === "select" ||
          getValues(`attributes.${index}.type`) === "multiselect") && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={optionsInput}
                onChange={(event_) => {
                  setOptionsInput(event_.target.value);
                }}
                placeholder="Nowa opcja"
                onKeyDown={(event_) => {
                  event_.key === "Enter" && addOption();
                }}
              />
              <Button variant="outline" onClick={addOption}>
                <PlusIcon className="h-4 w-4" />
                Dodaj opcję
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToHorizontalAxis]}
              >
                <SortableContext
                  items={getValues(`attributes.${index}.options`) ?? []}
                  strategy={horizontalListSortingStrategy}
                >
                  {getValues(`attributes.${index}.options`)?.map((option) => (
                    <SortableOption
                      key={option}
                      option={option}
                      onRemove={handleRemoveOption}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AttributeItem.displayName = "AttributeItem";

export function AttributesForm() {
  const { control } =
    useFormContext<z.infer<typeof EventAttributesFormSchema>>();

  const { fields, append, remove } = useFieldArray({
    name: "attributes",
    control,
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <p>Atrybuty</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                append({
                  id: fields.length + 1,
                  name: "",
                  type: "text" as AttributeType,
                  slug: "",
                  eventId: 0,
                  options: [],
                  showInList: true,
                  rootBlockId: undefined,
                  createdAt: "", // set it to empty string to avoid type error
                  updatedAt: "", // set it to empty string to avoid type error
                });
              }}
              className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {fields.map((attribute, index) => (
              <AttributeItem
                key={attribute.id}
                attribute={attribute}
                index={index}
                onRemove={() => {
                  remove(index);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
