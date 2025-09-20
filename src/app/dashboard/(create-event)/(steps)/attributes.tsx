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
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  GripVertical,
  Loader,
  PlusIcon,
  SquarePlus,
  TextIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ATTRIBUTE_TYPES } from "@/app/dashboard/events/[id]/settings/tabs/attributes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
import { toast } from "@/hooks/use-toast";
import { SLUG_REGEX, getBase64FromUrl } from "@/lib/utils";
import type { AttributeType, EventAttribute } from "@/types/attributes";

import { saveEvent } from "../actions";
import { FormContainer } from "../form-container";
import { AttributeTypes, eventAtom } from "../state";

const EventAttributesFormSchema = z.object({
  name: z.string().nonempty("Nazwa nie może być pusta"),
  type: z.enum(AttributeTypes),
});

interface AttributeItemProps {
  attribute: EventAttribute;
  onUpdate: (updatedAttribute: EventAttribute) => void;
  onRemove: () => void;
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

const AttributeItem = memo(
  ({ attribute, onUpdate, onRemove }: AttributeItemProps) => {
    const [optionsInput, setOptionsInput] = useState("");
    const [slugError, setSlugError] = useState("");

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
        } else {
          setSlugError("");
        }
        onUpdate({ ...attribute, slug: value });
      },
      [attribute, onUpdate],
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
                <AttributeTypeOptions />
              </SelectContent>
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
                defaultChecked={true}
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
        </div>
      </div>
    );
  },
);

AttributeItem.displayName = "AttributeItem";

export function AttributesForm({
  goToPreviousStep,
  disableNavguard,
}: {
  goToPreviousStep: () => void;
  disableNavguard: () => void;
}) {
  const [event, setEvent] = useAtom(eventAtom);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof EventAttributesFormSchema>>({
    resolver: zodResolver(EventAttributesFormSchema),
    defaultValues: {
      name: "",
      type: "text",
    },
  });
  const router = useRouter();

  function onSubmit(data: z.infer<typeof EventAttributesFormSchema>) {
    setEvent((_event) => ({
      ..._event,
      attributes: [
        ..._event.attributes,
        {
          id: event.attributes.length + 1,
          name: data.name,
          type: data.type,
          slug: data.name
            .toLowerCase()
            .replaceAll(/[^a-z0-9]+/g, "-")
            .replaceAll(/^-|-$/g, ""),
          eventId: 0,
          options: [],
          rootBlockId: undefined,
          showInList: true,
          createdAt: "", // set it to empty string to avoid type error
          updatedAt: "", // set it to empty string to avoid type error
        },
      ],
    }));
  }

  const handleUpdateAttribute = useCallback(
    (updatedAttribute: EventAttribute) => {
      setEvent((previous) => ({
        ...previous,
        attributes: previous.attributes.map((attribute) =>
          attribute.id === updatedAttribute.id ? updatedAttribute : attribute,
        ),
      }));
    },
    [setEvent],
  );

  const handleRemoveAttribute = useCallback(
    (attributeId: number) => {
      setEvent((previous) => ({
        ...previous,
        attributes: previous.attributes.filter((a) => a.id !== attributeId),
      }));
    },
    [setEvent],
  );

  async function createEvent() {
    setLoading(true);
    const base64Image = event.image ? await getBase64FromUrl(event.image) : "";
    const newEventObject = { ...event, image: base64Image };
    try {
      const result = await saveEvent(newEventObject);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "Nie udało się dodać wydarzenia!",
          description: "Spróbuj utworzyć wydarzenie ponownie",
        });
      } else {
        URL.revokeObjectURL(event.image);

        toast({
          title: "Dodano nowe wydarzenie",
        });

        setEvent({
          name: "",
          description: "",
          // Tomorrow, midnight
          startDate: new Date(new Date().setHours(24, 0, 0, 0)),
          endDate: new Date(new Date().setHours(24, 0, 0, 0)),
          location: "",
          organizer: "",
          image: "",
          color: "#3672fd",
          participantsNumber: 1,
          socialMediaLinks: [],
          slug: "",
          coorganizers: [],
          attributes: [],
        });

        disableNavguard();

        setTimeout(() => {
          router.push(`/dashboard/events/${result.id}`);
        }, 200);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem",
        description: "Sprawdź swoje połączenie z internetem",
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset({
        name: "",
        type: "text",
      });
      form.setFocus("name");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isSubmitSuccessful]);

  return (
    <FormContainer
      step="4/4"
      title="Krok 4"
      description="Dodaj atrybuty"
      icon={<TextIcon />}
    >
      <div className="flex w-full flex-col items-center">
        <div className="w-full space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              {event.attributes.length > 0 && (
                <p className="text-sm font-medium">Atrybuty</p>
              )}
              {event.attributes.map((attribute) => (
                <AttributeItem
                  key={attribute.id}
                  attribute={attribute}
                  onUpdate={handleUpdateAttribute}
                  onRemove={() => {
                    handleRemoveAttribute(attribute.id);
                  }}
                />
              ))}
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormLabel>Dodaj atrybut</FormLabel>
                <div className="flex flex-row items-center gap-2">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Nazwa"
                        disabled={form.formState.isSubmitting}
                      />
                    )}
                  />
                  <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="w-[180px]"
                              disabled={form.formState.isSubmitting}
                            >
                              <SelectValue placeholder="Wybierz typ atrybutu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <AttributeTypeOptions />
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    variant="outline"
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="flex w-full flex-row justify-between gap-4">
            <Button
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button className="w-min" onClick={createEvent} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : <SquarePlus />}{" "}
              Dodaj wydarzenie
            </Button>
          </div>
        </div>
      </div>
    </FormContainer>
  );
}
