import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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

interface SortableAttributeItemProps extends AttributeItemProps {
  id: number;
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
      <>
        <Button
          variant="eventGhost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-foreground my-2 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-2 lg:flex-row">
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

            <div className="flex flex-col justify-center gap-2">
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`isSensitiveData-${attribute.id.toString()}`}
                  checked={attribute.isSensitiveData}
                  onCheckedChange={(checked) => {
                    onUpdate({
                      ...attribute,
                      isSensitiveData: checked === true,
                    });
                  }}
                />
                <Label htmlFor={`isSensitiveData-${attribute.id.toString()}`}>
                  Wrażliwe dane
                </Label>
              </div>
            </div>
          </div>

          {attribute.isSensitiveData ? (
            <div className="my-2 flex flex-col gap-2">
              <Label htmlFor={`reason-${attribute.id.toString()}`}>
                Powód dla zbierania danych (wymagane dla danych wrażliwych)
              </Label>
              <Input
                id={`reason-${attribute.id.toString()}`}
                value={attribute.reason ?? ""}
                required={attribute.isSensitiveData}
                onChange={(event_) => {
                  onUpdate({ ...attribute, reason: event_.target.value });
                }}
                placeholder="np. 'Zorganizowanie posiłków w ośrodku'"
              />
            </div>
          ) : null}

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
      </>
    );
  },
);

AttributeItem.displayName = "AttributeItem";

const SortableAttributeItem = memo((props: SortableAttributeItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex gap-2 rounded-lg">
        <div
          className="my-2 hidden h-9 w-9 cursor-move items-center justify-center lg:inline-flex"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="text-muted-foreground h-4 w-4" />
        </div>
        <AttributeItem {...props} />
      </div>
    </div>
  );
});

SortableAttributeItem.displayName = "SortableAttributeItem";

export function Attributes({
  attributes,
  setAttributes,
  setAttributesChanges,
}: TabProps) {
  const [newAttributeLabel, setNewAttributeLabel] = useState("");
  const setIsDirty = useSetAtom(areSettingsDirty);

  // Sort attributes by order
  const sortedAttributes = useMemo(() => {
    return [...attributes].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [attributes]);

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
        const oldIndex = sortedAttributes.findIndex(
          (attribute) => attribute.id === active.id,
        );
        const newIndex = sortedAttributes.findIndex(
          (attribute) => attribute.id === over.id,
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedAttributes = arrayMove(
            sortedAttributes,
            oldIndex,
            newIndex,
          );

          // Update order values
          const updatedAttributes = reorderedAttributes.map(
            (attribute, index) => ({
              ...attribute,
              order: index,
            }),
          );

          setAttributes(updatedAttributes);

          // Mark all reordered attributes as updated
          setAttributesChanges((previous) => {
            const updatedSet = new Set(previous.updated.map((a) => a.id));
            const newUpdated = updatedAttributes.filter(
              (attribute) => attribute.id > 0 || updatedSet.has(attribute.id),
            );
            return {
              ...previous,
              updated: [
                ...previous.updated.filter(
                  (a) => !newUpdated.some((nu) => nu.id === a.id),
                ),
                ...newUpdated,
              ],
            };
          });
          setIsDirty(true);
        }
      }
    },
    [sortedAttributes, setAttributes, setAttributesChanges, setIsDirty],
  );

  const handleAddAttribute = useCallback(() => {
    if (!newAttributeLabel.trim()) {
      return;
    }

    const newSlug = newAttributeLabel
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "");

    const maxOrder = Math.max(...attributes.map((a) => a.order ?? 0), -1);

    const newAttribute: EventAttribute = {
      id: -Date.now(),
      name: newAttributeLabel.trim(),
      slug: newSlug,
      eventId: 0,
      showInList: true,
      options: [],
      type: "text",
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rootBlockId: undefined,
      isSensitiveData: false,
      reason: null,
    };

    setAttributes((previous) => [...previous, newAttribute]);
    setAttributesChanges((previous) => ({
      ...previous,
      added: [...previous.added, newAttribute],
    }));
    setNewAttributeLabel("");
    setIsDirty(true);
  }, [
    newAttributeLabel,
    attributes,
    setAttributes,
    setAttributesChanges,
    setIsDirty,
  ]);

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sortedAttributes.map((attribute) => attribute.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedAttributes.map((attribute) => (
                <SortableAttributeItem
                  key={attribute.id}
                  id={attribute.id}
                  attribute={attribute}
                  onUpdate={handleUpdateAttribute}
                  onRemove={() => {
                    handleRemoveAttribute(attribute.id);
                  }}
                  allAttributes={attributes}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-4 flex items-center gap-2">
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
  );
}
