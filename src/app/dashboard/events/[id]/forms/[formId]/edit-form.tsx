"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { EventAttribute } from "@/types/attributes";
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
  isOpen: z.boolean(),
  attributesIds: z.array(z.number()),
});

function EventFormEditForm({
  eventId,
  formToEdit,
  eventAttributes,
}: {
  eventId: string;
  formToEdit: EventForm;
  eventAttributes: EventAttribute[];
}) {
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: formToEdit.name,
      description: formToEdit.description,
      startTime: `${new Date(formToEdit.startDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.startDate).getMinutes().toString().padStart(2, "0")}`,
      endTime: `${new Date(formToEdit.endDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.endDate).getMinutes().toString().padStart(2, "0")}`,
      startDate: new Date(formToEdit.startDate),
      endDate: new Date(formToEdit.endDate),
      isOpen: formToEdit.isOpen,
      slug: formToEdit.slug,
      attributesIds: formToEdit.attributes.map((attribute) => attribute.id),
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    const result = await updateEventForm(eventId, formToEdit.id, {
      ...formToEdit,
      ...values,
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
              disabled={form.formState.isSubmitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa formularza</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Podaj nazwę formularza"
                      disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
              disabled={form.formState.isSubmitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="nazwa-formularza"
                      disabled={form.formState.isSubmitting}
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
              disabled={form.formState.isSubmitting}
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
              name="isOpen"
              control={form.control}
              disabled={form.formState.isSubmitting}
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
          <FormField
            control={form.control}
            name="attributesIds"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel>Wybierz atrybuty</FormLabel>
                {eventAttributes.map((attribute) => (
                  <FormField
                    key={attribute.id}
                    control={form.control}
                    name="attributesIds"
                    render={({ field }) => (
                      <FormItem
                        key={attribute.id}
                        className="flex flex-row items-start space-y-0 space-x-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(attribute.id)}
                            onCheckedChange={(checked: boolean) => {
                              checked
                                ? field.onChange([...field.value, attribute.id])
                                : field.onChange(
                                    field.value.filter(
                                      (value) => value !== attribute.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel>{attribute.name}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
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
