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
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AttributeType } from "@/types/attributes";

import { AttributeTypeOptions } from "./attribute-type-options";
import type { EventAttributesFormSchema } from "./schema";
import { SortableOption } from "./sortable-option";
import type { AttributeItemProps, NewEventAttribute } from "./types";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export function AttributeItem({
  attribute,
  index,
  onUpdateItem,
}: AttributeItemProps) {
  const { register, formState, setValue, getValues, watch } =
    useFormContext<z.infer<typeof EventAttributesFormSchema>>();
  const [optionsInput, setOptionsInput] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const allAttributes = watch("attributes");

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over != null && active.id !== over.id) {
      const oldOptions = getValues(`attributes.${index}.options`);
      const oldIndex = oldOptions?.indexOf(active.id.toString()) ?? -1;
      const newIndex = oldOptions?.indexOf(over.id.toString()) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1 && oldOptions != null) {
        const newOptions = arrayMove(oldOptions, oldIndex, newIndex);
        setValue(`attributes.${index}.options`, newOptions);
        onUpdateItem?.(index, getValues(`attributes.${index}`));
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
        onUpdateItem?.(index, getValues(`attributes.${index}`));
      }
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setValue(
      `attributes.${index}.options`,
      getValues(`attributes.${index}.options`)?.filter(
        (o) => o !== optionToRemove,
      ) ?? [],
    );
    onUpdateItem?.(index, getValues(`attributes.${index}`));
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Input
            defaultValue={attribute.name}
            {...register(`attributes.${index}.name`)}
            disabled={formState.isSubmitting}
            placeholder="Attribute label"
            className="flex-1"
            onBlur={() => {
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
          />
          <FormMessage>
            {formState.errors.attributes?.[index]?.name?.message}
          </FormMessage>
        </div>

        <Select
          defaultValue={attribute.type}
          onValueChange={(value: AttributeType) => {
            setValue(`attributes.${index}.type`, value);
            onUpdateItem?.(index, getValues(`attributes.${index}`));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <AttributeTypeOptions />
          </SelectContent>
        </Select>

        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`showInTable-${index.toString()}`}
              onCheckedChange={(checked) => {
                setValue(`attributes.${index}.showInList`, checked === true);
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              defaultChecked={attribute.showInList}
            />
            <Label htmlFor={`showInTable-${index.toString()}`}>
              Pokaż w tabeli
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`isSensitiveData-${index.toString()}`}
              onCheckedChange={(checked) => {
                setValue(
                  `attributes.${index}.isSensitiveData`,
                  checked === true,
                );
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              defaultChecked={attribute.isSensitiveData}
            />
            <Label htmlFor={`isSensitiveData-${index.toString()}`}>
              Wrażliwe dane
            </Label>
          </div>
        </div>
      </div>

      {watch(`attributes.${index}.isSensitiveData`) ? (
        <div className="my-2 flex flex-col gap-2">
          <Label htmlFor={`reason-${index.toString()}`}>
            Powód dla zbierania danych (wymagane dla danych wrażliwych)
          </Label>
          <Input
            id={`reason-${index.toString()}`}
            defaultValue={attribute.reason ?? ""}
            required={attribute.isSensitiveData}
            onChange={(event_) => {
              setValue(`attributes.${index}.reason`, event_.target.value);
            }}
            placeholder="np. 'Zorganizowanie posiłków w ośrodku'"
            onBlur={() => {
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
          />
          <FormMessage>
            {formState.errors.attributes?.[index]?.reason?.message}
          </FormMessage>
        </div>
      ) : null}

      {(watch(`attributes.${index}.type`) === "select" ||
        watch(`attributes.${index}.type`) === "multiselect") && (
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
                items={watch(`attributes.${index}.options`) ?? []}
                strategy={horizontalListSortingStrategy}
              >
                {watch(`attributes.${index}.options`)?.map((option) => (
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

      {watch(`attributes.${index}.type`) === "block" && (
        <div className="space-y-2">
          <Label htmlFor={`block-attributes-${index.toString()}`}>
            Wyświetlane atrybuty dla uczestników
          </Label>
          <MultiSelect
            id={`block-attributes-${index.toString()}`}
            options={[
              { label: "Email", value: "email" },
              ...(Array.isArray(allAttributes) ? allAttributes : [])
                .map((a, index_) => ({ ...a, _index: index_ }))
                .filter(
                  (
                    a,
                  ): a is NewEventAttribute & {
                    _index: number;
                    slug: string;
                  } =>
                    a._index !== index &&
                    typeof a.slug === "string" &&
                    a.slug.length > 0,
                )
                .map((a) => ({ label: a.name, value: a.slug })),
            ]}
            onValueChange={(values) => {
              setValue(`attributes.${index}.options`, values);
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
            defaultValue={getValues(`attributes.${index}.options`) ?? []}
            placeholder="Wybierz atrybuty do wyświetlenia"
          />
          <p className="text-muted-foreground text-sm">
            Jeśli nie wybrano żadnych atrybutów, zapisy będą anonimowe -
            uczestnicy będą widzieć tylko ilość zajętych miejsc.
          </p>
        </div>
      )}
    </div>
  );
}

AttributeItem.displayName = "AttributeItem";
