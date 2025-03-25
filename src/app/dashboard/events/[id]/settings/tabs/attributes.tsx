import {
  ALargeSmall,
  Binary,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  CloudUpload,
  Cuboid,
  LetterText,
  ListTodo,
  Mail,
  Palette,
  PlusIcon,
  Smartphone,
  SquareDashedMousePointer,
  TrashIcon,
} from "lucide-react";
import type { JSX } from "react";
import { memo, useCallback, useState } from "react";

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
import type { AttributeType, EventAttribute } from "@/types/attributes";

import type { TabProps } from "./tab-props";

const ATTRIBUTE_TYPES: {
  value: AttributeType;
  title: string;
  icon: JSX.Element;
}[] = [
  { value: "text", title: "Tekst", icon: <ALargeSmall /> },
  { value: "number", title: "Liczba", icon: <Binary /> },
  { value: "textarea", title: "Pole tekstowe", icon: <LetterText /> },
  { value: "file", title: "Plik", icon: <CloudUpload /> },
  { value: "select", title: "Wybór", icon: <SquareDashedMousePointer /> },
  { value: "multiselect", title: "Wielokrotny wybór", icon: <ListTodo /> },
  { value: "block", title: "Blok", icon: <Cuboid /> },
  { value: "date", title: "Data", icon: <Calendar /> },
  { value: "time", title: "Czas", icon: <Clock /> },
  { value: "datetime", title: "Data i czas", icon: <CalendarClock /> },
  { value: "email", title: "Email", icon: <Mail /> },
  { value: "tel", title: "Telefon", icon: <Smartphone /> },
  { value: "color", title: "Kolor", icon: <Palette /> },
  { value: "checkbox", title: "Pole wyboru", icon: <Check /> },
];

const slugRegex = /^[a-z0-9-]+$/;

interface AttributeItemProps {
  attribute: EventAttribute;
  onUpdate: (updatedAttribute: EventAttribute) => void;
  onRemove: () => void;
}

const AttributeItem = memo(
  ({ attribute, onUpdate, onRemove }: AttributeItemProps) => {
    const [optionsInput, setOptionsInput] = useState("");
    const [slugError, setSlugError] = useState("");

    const handleSlugChange = (value: string) => {
      if (!slugRegex.test(value)) {
        setSlugError("Slug może zawierać tylko małe litery, cyfry i myślniki");
      } else if (value.length < 3) {
        setSlugError("Slug musi mieć co najmniej 3 znaki");
      } else {
        setSlugError("");
      }
      onUpdate({ ...attribute, slug: value });
    };

    const addOption = () => {
      if (optionsInput.trim()) {
        const newOptions = [...(attribute.options ?? []), optionsInput.trim()];
        onUpdate({ ...attribute, options: newOptions });
        setOptionsInput("");
      }
    };

    return (
      <div className="mb-2 flex gap-2 rounded-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-foreground my-2 hover:bg-red-500/10"
        >
          <TrashIcon className="h-4 w-4" />
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
              <SelectContent>
                {ATTRIBUTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="overflow-x-hidden text-ellipsis">
                        {type.title}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              <Input
                value={attribute.slug}
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
                id={`showInTable-${attribute.slug}`}
                checked={attribute.showInList}
                onCheckedChange={(checked) => {
                  onUpdate({ ...attribute, showInList: checked === true });
                }}
              />
              <Label htmlFor={`showInTable-${attribute.slug}`}>
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
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={addOption}
                >
                  <PlusIcon className="h-4 w-4" />
                  Dodaj opcję
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attribute.options?.map((option, index) => (
                  <div
                    key={`${attribute.id.toString()}-${option}`}
                    className="flex items-center gap-1 rounded border-2 px-2 py-1 text-sm"
                  >
                    {option}
                    <button
                      onClick={() => {
                        onUpdate({
                          ...attribute,
                          options:
                            attribute.options?.filter(
                              (_, index_) => index_ !== index,
                            ) ?? [],
                        });
                      }}
                      className="text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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

  const handleAddAttribute = () => {
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
      eventId: 0, // Will be set by parent component
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
  };

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
    },
    [setAttributes, setAttributesChanges],
  );

  const handleRemoveAttribute = useCallback(
    (attributeId: number) => {
      setAttributes((previous) => previous.filter((a) => a.id !== attributeId));
      setAttributesChanges((previous) => ({
        ...previous,
        deleted: [
          ...previous.deleted,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          attributes.find((a) => a.id === attributeId)!,
        ],
      }));
    },
    [attributes, setAttributes, setAttributesChanges],
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
