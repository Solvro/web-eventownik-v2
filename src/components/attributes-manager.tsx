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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";

export interface AttributeItemProps {
  id: number;
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
  attribute,
  isIncluded,
  isRequired,
  handleIncludeToggle,
  handleRequiredToggle,
}: AttributeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-accent/50 mb-2 flex items-center rounded-lg p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
        isDragging ? "z-50 opacity-50 shadow-lg" : ""
      }`}
    >
      <button
        {...listeners}
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) {
      return;
    }

    const oldIndex = includedAttributes.findIndex(
      (attribute) => attribute.id === active.id,
    );
    const newIndex = includedAttributes.findIndex(
      (attribute) => attribute.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(includedAttributes, oldIndex, newIndex).map(
      (attribute, index) => ({ ...attribute, order: index }),
    );
    setIncludedAttributes(newOrder);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {isMounted ? ( // Only render SortableContext when mounted
          <SortableContext items={includedAttributes}>
            <div className="space-y-2">
              <h2 className="text-sm">Wybrane atrybuty</h2>
              {includedAttributes.map((attribute) => {
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
          </SortableContext>
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
    </DndContext>
  );
}

export { AttributesReorder, AttributeItem };
