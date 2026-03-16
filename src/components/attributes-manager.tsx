"use client";

import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import type { DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { GripHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";

export interface AttributeItemProps {
  id: number;
  index: number;
  attribute: EventAttribute;
  isIncluded: boolean;
  isRequired: boolean;
  handleIncludeToggle: (attribute: EventAttribute) => void;
  handleRequiredToggle: (attribute: EventAttribute) => void;
}

export interface AttributesReorderProps {
  attributes: EventAttribute[];
  includedAttributes: FormAttributeBase[];
  setIncludedAttributes: React.Dispatch<
    React.SetStateAction<FormAttributeBase[]>
  >;
}

function AttributeItem({
  id,
  index,
  attribute,
  isIncluded,
  isRequired,
  handleIncludeToggle,
  handleRequiredToggle,
}: AttributeItemProps) {
  const { ref, handleRef, isDragSource } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      className={`bg-accent/50 mb-2 flex items-center rounded-lg p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
        isDragSource ? "z-50 opacity-50 shadow-lg" : ""
      }`}
    >
      <button
        ref={handleRef}
        className="flex cursor-grab touch-none items-center px-2 opacity-50 hover:opacity-100 active:cursor-grabbing"
        type="button"
      >
        <GripHorizontal />
      </button>
      <Checkbox
        className="mr-2"
        checked={isIncluded}
        onCheckedChange={() => {
          handleIncludeToggle(attribute);
        }}
      />
      <div className="flex-1">
        <h3 className="font-semibold">{attribute.name}</h3>
      </div>
      <span className="bg-popover flex items-center rounded-full px-3 py-1 text-sm">
        <Label htmlFor={`required-${attribute.id.toString()}`}>Wymagane</Label>
        <Checkbox
          id={`required-${attribute.id.toString()}`}
          className="ml-2"
          checked={isRequired}
          onCheckedChange={() => {
            handleRequiredToggle(attribute);
          }}
        />
      </span>
    </div>
  );
}

function AttributesReorder({
  attributes,
  includedAttributes,
  setIncludedAttributes,
}: AttributesReorderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isIncluded = (attributeId: number) => {
    return includedAttributes.some((attribute) => attribute.id === attributeId);
  };

  const handleIncludeToggle = (attribute: EventAttribute) => {
    if (isIncluded(attribute.id)) {
      setIncludedAttributes((previous) =>
        previous.filter((attribute_) => attribute_.id !== attribute.id),
      );
    } else {
      setIncludedAttributes((previous) => [
        ...previous,
        {
          ...attribute,
          isRequired: true,
          isEditable: true,
          order: previous.length,
        },
      ]);
    }
  };

  const handleRequiredToggle = (attribute: EventAttribute) => {
    setIncludedAttributes((previous) =>
      previous.map((attribute_) =>
        attribute_.id === attribute.id
          ? { ...attribute_, isRequired: !attribute_.isRequired }
          : attribute_,
      ),
    );
  };

  const includedIds = new Set(
    includedAttributes.map((attribute) => attribute.id),
  );
  const nonIncludedAttributes = attributes.filter(
    (attribute) => !includedIds.has(attribute.id),
  );

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) {
      return;
    }

    const { source } = event.operation;

    if (source != null && isSortable(source)) {
      const initialIndex = source.sortable.initialIndex;
      const index = source.index;

      if (initialIndex !== index) {
        setIncludedAttributes((previous) => {
          const newOrder = [...previous];
          const [removed] = newOrder.splice(initialIndex, 1);
          newOrder.splice(index, 0, removed);
          return newOrder.map((attribute, index_) => ({
            ...attribute,
            order: index_,
          }));
        });
      }
    }
  };

  return (
    <DragDropProvider
      modifiers={[RestrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {isMounted ? (
          <div className="space-y-2">
            <h2 className="text-sm">Wybrane atrybuty</h2>
            {includedAttributes.map((attribute, index) => {
              const fullAttribute = attributes.find(
                (a) => a.id === attribute.id,
              );
              if (fullAttribute == null) {
                return null;
              }
              return (
                <AttributeItem
                  key={attribute.id}
                  id={attribute.id}
                  index={index}
                  attribute={fullAttribute}
                  isIncluded={true}
                  isRequired={attribute.isRequired}
                  handleIncludeToggle={handleIncludeToggle}
                  handleRequiredToggle={handleRequiredToggle}
                />
              );
            })}
            {includedAttributes.length === 0 && (
              <p className="text-center text-sm text-gray-800">
                Nie dodano jeszcze żadnych atrybutów
              </p>
            )}
          </div>
        ) : (
          // Server fallback without drag-and-drop features
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Ładowanie atrybutów...
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-sm">Pozostałe atrybuty</h2>
          {nonIncludedAttributes.map((attribute) => (
            <div
              key={attribute.id}
              className="bg-accent/50 mb-2 flex items-center rounded-lg p-4 shadow-sm"
            >
              <Checkbox
                className="mr-2"
                checked={false}
                onCheckedChange={() => {
                  handleIncludeToggle(attribute);
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold">{attribute.name}</h3>
              </div>
            </div>
          ))}
          {nonIncludedAttributes.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              Wszystkie atrybuty są już dodane
            </p>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}

export { AttributesReorder, AttributeItem };
