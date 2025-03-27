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
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, GripHorizontal, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { updateEventForm } from "../actions";

const EventFormSchema = z.object({
  name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
  description: z.string().nonempty({ message: "Opis jest wymagany" }),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "Data zakończenia musi być po dacie rozpoczęcia.",
  }),
  slug: z.string().min(1, { message: "Slug jest wymagany" }),
  isFirstForm: z.boolean(),
});

interface AttributeItemProps {
  id: number;
  attribute: EventAttribute;
  isIncluded: boolean;
  isRequired: boolean;
  handleIncludeToggle: (attribute: EventAttribute) => void;
  handleRequiredToggle: (attribute: EventAttribute) => void;
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
      className={`mb-2 flex items-center rounded-lg bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
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
        <h3 className="font-semibold text-gray-800">{attribute.name}</h3>
      </div>
      <span className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm">
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

interface AttributesReorderProps {
  attributes: EventAttribute[];
  includedAttributes: FormAttributeBase[];
  setIncludedAttributes: React.Dispatch<
    React.SetStateAction<FormAttributeBase[]>
  >;
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
        { ...attribute, isRequired: true, isEditable: true },
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
              <h2 className="text-sm text-gray-800">Wybrane atrybuty</h2>
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
                <p className="text-center text-sm text-gray-500">
                  Nie dodano jeszcze żadnych atrybutów
                </p>
              )}
            </div>
          </SortableContext>
        ) : (
          // Server fallback without drag-and-drop features
          <div className="space-y-2">
            <p className="text-sm text-gray-800">Ładowanie atrybutów...</p>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-sm text-gray-800">Pozostałe atrybuty</h2>
          {nonIncludedAttributes.map((attribute) => (
            <div
              key={attribute.id}
              className="mb-2 flex items-center rounded-lg bg-white p-4 shadow-sm"
            >
              <Checkbox
                className="mr-2"
                checked={false}
                onCheckedChange={() => {
                  handleIncludeToggle(attribute);
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {attribute.name}
                </h3>
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

interface EventFormEditFormProps {
  eventId: string;
  formToEdit: EventForm;
  eventAttributes: EventAttribute[];
}

function EventFormEditForm({
  eventId,
  formToEdit,
  eventAttributes,
}: EventFormEditFormProps) {
  const [includedAttributes, setIncludedAttributes] = useState<
    FormAttributeBase[]
  >(formToEdit.attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: formToEdit.name,
      description: formToEdit.description,
      startTime: `${new Date(formToEdit.startDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.startDate).getMinutes().toString().padStart(2, "0")}`,
      endTime: `${new Date(formToEdit.endDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.endDate).getMinutes().toString().padStart(2, "0")}`,
      startDate: new Date(formToEdit.startDate),
      endDate: new Date(formToEdit.endDate),
      isFirstForm: formToEdit.isFirstForm,
      slug: formToEdit.slug,
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    const result = await updateEventForm(eventId, formToEdit.id, {
      ...formToEdit,
      ...values,
      attributes: includedAttributes,
    });

    if (result.success) {
      toast({
        title: "Formularz został zaktualizowany",
      });

      router.refresh();
    } else {
      toast({
        title: "Nie udało się zaktualizować formularza",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex max-w-xl flex-col gap-8">
          <div className="w-full space-y-8">
            <FormField
              name="name"
              control={form.control}
              // https://github.com/orgs/react-hook-form/discussions/10964?sort=new#discussioncomment-8481087
              disabled={form.formState.isSubmitting ? true : undefined}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa formularza</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Podaj nazwę formularza"
                      disabled={form.formState.isSubmitting ? true : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Data i godzina</FormLabel>
              <div className="flex flex-row items-center gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  disabled={form.formState.isSubmitting ? true : undefined}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-[240px] pl-3 text-left font-normal"
                            >
                              {format(field.value, "PPP")}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="z-50"
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              new Date(date) <=
                              new Date(form.getValues("startDate"))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.startDate?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  disabled={form.formState.isSubmitting ? true : undefined}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.startTime?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-row items-center gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  disabled={form.formState.isSubmitting ? true : undefined}
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-[240px] pl-3 text-left font-normal"
                            >
                              {format(field.value, "PPP")}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="z-50"
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              new Date(date) <=
                              new Date(form.getValues("startDate"))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.endDate?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  disabled={form.formState.isSubmitting ? true : undefined}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.endTime?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* TODO: Make the slug auto-generated from the name */}
            <FormField
              name="slug"
              control={form.control}
              disabled={form.formState.isSubmitting ? true : undefined}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="nazwa-formularza"
                      disabled={form.formState.isSubmitting ? true : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.slug?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-8">
            {/* TODO: Replace with a WYSIWYG editor */}
            <FormField
              name="description"
              control={form.control}
              disabled={form.formState.isSubmitting ? true : undefined}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Dodaj tekst wstępny</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-5/6 resize-none" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            {/* TODO: Not currently handled on the backend */}
            <FormField
              name="isFirstForm"
              control={form.control}
              disabled={form.formState.isSubmitting ? true : undefined}
              render={({ field }) => (
                <FormItem className="flex w-fit flex-col">
                  <FormLabel>Formularz rejestracyjny?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="m-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <AttributesReorder
            attributes={eventAttributes}
            includedAttributes={includedAttributes}
            setIncludedAttributes={setIncludedAttributes}
          />
        </div>
        <Button type="submit">
          <Save /> Zapisz
        </Button>
      </form>
    </Form>
  );
}

export { EventFormEditForm };
