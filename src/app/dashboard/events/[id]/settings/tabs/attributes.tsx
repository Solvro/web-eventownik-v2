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

const ATTRIBUTE_TYPES: { value: AttributeType; icon: JSX.Element }[] = [
  { value: "text", icon: <ALargeSmall /> },
  { value: "number", icon: <Binary /> },
  { value: "textarea", icon: <LetterText /> },
  { value: "file", icon: <CloudUpload /> },
  { value: "select", icon: <SquareDashedMousePointer /> },
  { value: "select-multiple", icon: <ListTodo /> },
  { value: "block", icon: <Cuboid /> },
  { value: "date", icon: <Calendar /> },
  { value: "time", icon: <Clock /> },
  { value: "datetime", icon: <CalendarClock /> },
  { value: "email", icon: <Mail /> },
  { value: "tel", icon: <Smartphone /> },
  { value: "color", icon: <Palette /> },
  { value: "checkbox", icon: <Check /> },
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
        setSlugError("Only lowercase letters, numbers, and hyphens allowed");
      } else if (value.length < 3) {
        setSlugError("Slug must be at least 3 characters");
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
      <div className="mb-2 flex items-center gap-4 rounded-lg border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={attribute.name}
              onChange={(event_) => {
                onUpdate({ ...attribute, name: event_.target.value });
              }}
              placeholder="Attribute label"
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
                      <span>{type.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {attribute.type === "select" ||
            (attribute.type === "select-multiple" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={optionsInput}
                    onChange={(event_) => {
                      setOptionsInput(event_.target.value);
                    }}
                    placeholder="Add option"
                    onKeyDown={(event_) => {
                      event_.key === "Enter" && addOption();
                    }}
                  />
                  <Button onClick={addOption}>Add Option</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attribute.options?.map((option, index) => (
                    <div
                      key={index}
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
            ))}

          <div className="flex gap-2">
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
      id: Date.now(), // Temporary ID for new attributes
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
              placeholder="New attribute label"
              className="flex-1"
              onKeyDown={(event_) => {
                event_.key === "Enter" && handleAddAttribute();
              }}
            />
            <Button onClick={handleAddAttribute}>Add Attribute</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
