"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, getHours, getMinutes, subDays } from "date-fns";
import { useAtom } from "jotai";
import {
  ArrowRight,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WysiwygEditor } from "@/components/editor";
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
import { useAutoSave } from "@/hooks/use-autosave";

import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

const EventGeneralInfoSchema = z.object({
  name: z.string().nonempty("Nazwa nie może być pusta."),
  description: z.string().optional(),
  startDate: z.date(),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endDate: z.date(),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  location: z.string().optional(),
  organizer: z.string().optional(),
});

export function GeneralInfoForm({
  goToNextStep,
}: {
  goToNextStep: () => void;
}) {
  const [event, setEvent] = useAtom(eventAtom);
  const form = useForm<z.infer<typeof EventGeneralInfoSchema>>({
    resolver: zodResolver(EventGeneralInfoSchema),
    defaultValues: {
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      startTime: `${getHours(event.startDate).toString()}:${getMinutes(event.startDate).toString().padStart(2, "0")}`,
      endDate: event.endDate,
      endTime: `${getHours(event.endDate).toString()}:${getMinutes(event.endDate).toString().padStart(2, "0")}`,
      location: event.location,
      organizer: event.organizer,
    },
  });

  function onSubmit(values: z.infer<typeof EventGeneralInfoSchema>) {
    values.startDate.setHours(Number.parseInt(values.startTime.split(":")[0]));
    values.startDate.setMinutes(
      Number.parseInt(values.startTime.split(":")[1]),
    );
    values.endDate.setHours(Number.parseInt(values.endTime.split(":")[0]));
    values.endDate.setMinutes(Number.parseInt(values.endTime.split(":")[1]));
    if (values.startDate < new Date()) {
      form.setError("startDate", {
        message: "Data rozpoczęcia nie może być w przeszłości.",
      });
      return;
    }
    if (values.endDate < values.startDate) {
      form.setError("endDate", {
        message: "Data zakończenia musi być po dacie rozpoczęcia.",
      });
      return;
    }
    goToNextStep();
  }

  useAutoSave(setEvent, form);

  return (
    <FormContainer
      step="1/4"
      title="Krok 1"
      description="Podaj podstawowe informacje o wydarzeniu"
      icon={<CalendarIcon />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col items-end gap-4"
        >
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="w-full space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nazwa</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={form.formState.isSubmitting}
                        placeholder="Podaj nazwę wydarzenia"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500">
                      {form.formState.errors.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-end gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data i godzina rozpoczęcia</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-[240px] pl-3 text-left font-normal"
                              >
                                {format(field.value, "PPP")}
                                <CalendarArrowDownIcon className="ml-auto h-4 w-4 opacity-50" />
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
                                date <= subDays(new Date(), 1)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormControl>
                          <Input
                            disabled={form.formState.isSubmitting}
                            type="time"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.startDate?.message}
                </FormMessage>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.startTime?.message}
                </FormMessage>
              </div>
              <div className="space-y-2">
                <FormLabel>Data i godzina zakończenia</FormLabel>
                <div className="flex flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-[240px] pl-3 text-left font-normal"
                                disabled={form.formState.isSubmitting}
                              >
                                {format(field.value, "PPP")}
                                <CalendarArrowUpIcon className="ml-auto h-4 w-4 opacity-50" />
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
                                  ? subDays(new Date(), 1)
                                  : form.getValues("startDate"))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormControl>
                          <Input
                            disabled={form.formState.isSubmitting}
                            type="time"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.endDate?.message}
                </FormMessage>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.endTime?.message}
                </FormMessage>
              </div>
            </div>
            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Opis</FormLabel>
                    <WysiwygEditor
                      content={form.getValues("description") ?? ""}
                      onChange={field.onChange}
                    />
                    <FormMessage>
                      {form.formState.errors.description?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-4">
            <FormField
              name="location"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Miejsce (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={form.formState.isSubmitting}
                      placeholder="Podaj miejsce wydarzenia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500">
                    {form.formState.errors.location?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="organizer"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Organizator (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={form.formState.isSubmitting}
                      placeholder="Podaj organizatora wydarzenia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500">
                    {form.formState.errors.organizer?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          <Button
            className="w-min"
            variant="ghost"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? (
              <>
                Zapisywanie danych... <Loader2 className="animate-spin" />
              </>
            ) : (
              <>
                Dalej <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </Form>
    </FormContainer>
  );
}
