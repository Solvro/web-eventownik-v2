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
import { useSetAtom } from "jotai";
import {
  ALargeSmall,
  Binary,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  CloudUpload,
  Cuboid,
  GripVertical,
  LetterText,
  ListTodo,
  Mail,
  Palette,
  PlusIcon,
  Smartphone,
  SquareDashedMousePointer,
  Trash2,
} from "lucide-react";
import type { JSX } from "react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
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

import { areSettingsDirty } from "../settings-context";
import type { TabProps } from "./tab-props";

export const ATTRIBUTE_TYPES: {
  value: AttributeType;
  title: string;
  description?: string;
  icon: JSX.Element;
}[] = [
  {
    value: "text",
    title: "Tekst",
    description: "Krótkie pole tekstowe",
    icon: <ALargeSmall />,
  },
  {
    value: "number",
    title: "Liczba",
    description: "Dozwolone jedynie liczby, nie litery",
    icon: <Binary />,
  },
  {
    value: "textarea",
    title: "Pole tekstowe",
    description: "Dłuższe pole tekstowe",
    icon: <LetterText />,
  },
  {
    value: "file",
    title: "Plik",
    description: "Przesłanie pliku każdego typu",
    icon: <CloudUpload />,
  },
  {
    value: "select",
    title: "Wybór",
    description: "Wybór 1 opcji spośród możliwych z listy rozwijanej",
    icon: <SquareDashedMousePointer />,
  },
  {
    value: "multiselect",
    title: "Wielokrotny wybór",
    description: "Wybór kilku opcji spośród możliwych",
    icon: <ListTodo />,
  },
  {
    value: "block",
    title: "Blok",
    description: "Zapisy na miejsca",
    icon: <Cuboid />,
  },
  {
    value: "date",
    title: "Data",
    description: "Dzień, miesiąc, rok",
    icon: <Calendar />,
  },
  {
    value: "time",
    title: "Czas",
    description: "Godzina i minuta",
    icon: <Clock />,
  },
  {
    value: "datetime",
    title: "Data i czas",
    description: "Dzień, miesiąc, rok, godzina, minuta",
    icon: <CalendarClock />,
  },
  {
    value: "email",
    title: "Email",
    description: "Wymagany format email",
    icon: <Mail />,
  },
  {
    value: "tel",
    title: "Telefon",
    description: "Wymagany format telefonu",
    icon: <Smartphone />,
  },
  {
    value: "color",
    title: "Kolor",
    description: "Podanie koloru w kodzie RGB, HSL, HEX",
    icon: <Palette />,
  },
  {
    value: "checkbox",
    title: "Pole wyboru",
    description: "Pole, które można zaznaczyć lub odznaczyć",
    icon: <Check />,
  },
];

interface AttributeItemProps {
  attribute: EventAttribute;
  onUpdate: (updatedAttribute: EventAttribute) => void;
  onRemove: () => void;
  allAttributes: EventAttribute[];
}

interface SortableOptionProps {
  option: string;
  onRemove: (option: string) => void;
}

const SortableOption = memo(({ option, onRemove }: SortableOptionProps) => {
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
});
SortableOption.displayName = "SortableOption";

const AttributeItem = memo(
  ({ attribute, onUpdate, onRemove, allAttributes }: AttributeItemProps) => {
    const [optionsInput, setOptionsInput] = useState("");
    const [slugError, setSlugError] = useState("");

    useEffect(() => {
      if (attribute.type === "block" && Array.isArray(attribute.options)) {
        const validOptions = new Set([
          "email",
          ...allAttributes
            .filter(
              (attribute_) =>
                attribute_.id !== attribute.id &&
                typeof attribute_.slug === "string",
            )
            .map((attribute_) => attribute_.slug),
        ]);

        const validSelectedOptions = attribute.options.filter((option) =>
          validOptions.has(option),
        );

        if (validSelectedOptions.length !== attribute.options.length) {
          onUpdate({
            ...attribute,
            options: validSelectedOptions,
          });
        }
      }
    }, [attribute, allAttributes, onUpdate]);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (over != null && active.id !== over.id) {
          const oldIndex =
            attribute.options?.indexOf(active.id.toString()) ?? -1;
          const newIndex = attribute.options?.indexOf(over.id.toString()) ?? -1;
          if (oldIndex !== -1 && newIndex !== -1 && attribute.options != null) {
            const newOptions = arrayMove(attribute.options, oldIndex, newIndex);
            onUpdate({ ...attribute, options: newOptions });
          }
        }
      },
      [attribute, onUpdate],
    );

    const addOption = useCallback(() => {
      const trimmedValue = optionsInput.trim();
      if (trimmedValue) {
        const exists = attribute.options?.includes(trimmedValue) ?? false;
        if (!exists) {
          const newOptions = [...(attribute.options ?? []), trimmedValue];
          onUpdate({ ...attribute, options: newOptions });
          setOptionsInput("");
        }
      }
    }, [optionsInput, attribute, onUpdate]);

    const handleSlugChange = useCallback(
      (value: string) => {
        if (!SLUG_REGEX.test(value)) {
          setSlugError(
            "Slug może zawierać tylko małe litery, cyfry i myślniki",
          );
        } else if (value.length < 3) {
          setSlugError("Slug musi mieć co najmniej 3 znaki");
        } else if (
          allAttributes.some(
            (attribute_) =>
              attribute_.id !== attribute.id && attribute_.slug === value,
          )
        ) {
          setSlugError(
            `Slug jest już używany (pole: "${allAttributes.find((attribute_) => attribute_.slug === value)?.name ?? "?"}")`,
          );
        } else {
          setSlugError("");
        }
        onUpdate({ ...attribute, slug: value });
      },
      [attribute, onUpdate, allAttributes],
    );

    const handleRemoveOption = useCallback(
      (optionToRemove: string) => {
        onUpdate({
          ...attribute,
          options: attribute.options?.filter((o) => o !== optionToRemove) ?? [],
        });
      },
      [attribute, onUpdate],
    );

    const attributeTypeOptions = useMemo(
      () =>
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
        )),
      [],
    );

    return (
      <div className="mb-2 flex gap-2 rounded-lg p-2">
        <Button
          variant="eventGhost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-foreground my-2 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={attribute.name}
              onChange={(event_) => {
                onUpdate({ ...attribute, name: event_.target.value });
              }}
              placeholder="Attribute label"
              className="flex-1"
            />

            <Select
              value={attribute.type}
              onValueChange={(value: AttributeType) => {
                onUpdate({ ...attribute, type: value });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>{attributeTypeOptions}</SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              <Input
                value={
                  attribute.slug ??
                  attribute.name
                    .toLowerCase()
                    .replaceAll(/[^a-z0-9]+/g, "-")
                    .replaceAll(/^-|-$/g, "")
                }
                onChange={(event_) => {
                  handleSlugChange(event_.target.value);
                }}
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
                checked={attribute.showInList}
                onCheckedChange={(checked) => {
                  onUpdate({ ...attribute, showInList: checked === true });
                }}
              />
              <Label htmlFor={`showInTable-${attribute.id.toString()}`}>
                Pokaż w tabeli
              </Label>
            </div>
          </div>

          {(attribute.type === "select" ||
            attribute.type === "multiselect") && (
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
                    items={attribute.options ?? []}
                    strategy={horizontalListSortingStrategy}
                  >
                    {attribute.options?.map((option) => (
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

          {attribute.type === "block" && (
            <div className="space-y-2">
              <Label htmlFor={`block-attributes-${attribute.id.toString()}`}>
                Wyświetlane atrybuty dla uczestników
              </Label>
              <MultiSelect
                id={`block-attributes-${attribute.id.toString()}`}
                options={[
                  { label: "Email", value: "email" },
                  ...allAttributes
                    .filter((a) => a.id !== attribute.id && a.slug != null)
                    .map((a) => ({
                      label: a.name,
                      value: a.slug ?? "",
                    })),
                ]}
                onValueChange={(values) => {
                  onUpdate({ ...attribute, options: values });
                }}
                defaultValue={attribute.options ?? []}
                placeholder="Wybierz atrybuty do wyświetlenia"
              />
              <p className="text-muted-foreground text-sm">
                Jeśli nie wybrano żadnych atrybutów, zapisy będą anonimowe -
                uczestnicy będą widzieć tylko ilość zajętych miejsc.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

AttributeItem.displayName = "AttributeItem";

export function Attributes({
  attributes,
  setAttributes,
  setAttributesChanges,
}: TabProps) {
  const [newAttributeLabel, setNewAttributeLabel] = useState("");
  const setIsDirty = useSetAtom(areSettingsDirty);

  const handleAddAttribute = useCallback(() => {
    if (!newAttributeLabel.trim()) {
      return;
    }

    const newSlug = newAttributeLabel
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "");

    const newAttribute: EventAttribute = {
      id: -Date.now(),
      name: newAttributeLabel.trim(),
      slug: newSlug,
      eventId: 0,
      showInList: true,
      options: [],
      type: "text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rootBlockId: undefined,
    };

    setAttributes((previous) => [...previous, newAttribute]);
    setAttributesChanges((previous) => ({
      ...previous,
      added: [...previous.added, newAttribute],
    }));
    setNewAttributeLabel("");
    setIsDirty(true);
  }, [newAttributeLabel, setAttributes, setAttributesChanges, setIsDirty]);

  const handleUpdateAttribute = useCallback(
    (updatedAttribute: EventAttribute) => {
      setAttributes((previous) =>
        previous.map((attribute) =>
          attribute.id === updatedAttribute.id ? updatedAttribute : attribute,
        ),
      );
      setAttributesChanges((previous) => ({
        ...previous,
        updated: previous.updated.some((a) => a.id === updatedAttribute.id)
          ? previous.updated.map((a) =>
              a.id === updatedAttribute.id ? updatedAttribute : a,
            )
          : [...previous.updated, updatedAttribute],
      }));
      setIsDirty(true);
    },
    [setAttributes, setAttributesChanges, setIsDirty],
  );

  const handleRemoveAttribute = useCallback(
    (attributeId: number) => {
      setAttributes((previous) => {
        const removedAttribute = previous.find((a) => a.id === attributeId);
        if (removedAttribute != null) {
          setAttributesChanges((previousChanges) => ({
            ...previousChanges,
            deleted: [...previousChanges.deleted, removedAttribute],
          }));
        }
        return previous.filter((a) => a.id !== attributeId);
      });
      setIsDirty(true);
    },
    [setAttributes, setAttributesChanges, setIsDirty],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col">
        <p className="mb-4 text-sm font-medium">Event Attributes</p>
        <div className="space-y-4">
          {attributes.map((attribute) => (
            <AttributeItem
              key={attribute.id}
              attribute={attribute}
              onUpdate={handleUpdateAttribute}
              onRemove={() => {
                handleRemoveAttribute(attribute.id);
              }}
              allAttributes={attributes}
            />
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newAttributeLabel}
              onChange={(event_) => {
                setNewAttributeLabel(event_.target.value);
              }}
              placeholder="Nazwa nowego atrybutu"
              className="flex-1"
              onKeyDown={(event_) => {
                event_.key === "Enter" && handleAddAttribute();
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleAddAttribute}
            >
              <PlusIcon className="h-4 w-4" />
              Nowy atrybut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
