"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { ArrowRight, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

import { newEventFormAtom } from "../state";

const EventFormGeneralInfoSchema = z.object({
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
});

function GeneralInfoForm({ goToNextStep }: { goToNextStep: () => void }) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);

  const form = useForm<z.infer<typeof EventFormGeneralInfoSchema>>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: newEventForm.name,
      description: newEventForm.description,
      startTime: `${newEventForm.startDate.getHours().toString().padStart(2, "0")}:${newEventForm.startDate.getMinutes().toString().padStart(2, "0")}`,
      endTime: `${newEventForm.endDate.getHours().toString().padStart(2, "0")}:${newEventForm.endDate.getMinutes().toString().padStart(2, "0")}`,
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      isOpen: newEventForm.isOpen,
      slug: newEventForm.slug,
    },
  });

  function onSubmit(values: z.infer<typeof EventFormGeneralInfoSchema>) {
    // console.log(values);
    setNewEventForm({ ...newEventForm, ...values });
    goToNextStep();
  }

  function onError(errors: unknown) {
    console.warn(errors);
    console.warn(form.getValues());
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
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
                            disabled={(date) =>
                              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                              form.getValues("endDate") === undefined
                                ? date <= new Date()
                                : new Date() >= date ||
                                  date > form.getValues("endDate")
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
                            disabled={(date) =>
                              date <
                              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                              (form.getValues("startDate") === undefined
                                ? new Date()
                                : form.getValues("startDate"))
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
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" type="submit">
            <ArrowRight /> Dalej
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { GeneralInfoForm };
