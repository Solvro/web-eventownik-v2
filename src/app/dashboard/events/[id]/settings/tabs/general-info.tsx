import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatISO9075, getHours, getMinutes } from "date-fns";
import { useSetAtom } from "jotai";
import { CalendarArrowDownIcon, CalendarArrowUpIcon } from "lucide-react";
import { useEffect } from "react";
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

import { areSettingsDirty } from "../settings-context";
import type { TabProps } from "./tab-props";

const EventGeneralInfoSchema = z
  .object({
    name: z.string().nonempty("Nazwa nie może być pusta."),
    description: z.string().optional(),
    startDate: z.date(),
    startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
    endDate: z.date(),
    endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
    location: z.string().optional(),
    organizer: z.string().optional(),
  })
  .refine(
    (data) => {
      const startDateTime = new Date(data.startDate);
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(data.endDate);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes);

      return startDateTime <= endDateTime;
    },
    {
      message:
        "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
      path: ["endDate"],
    },
  );

export function General({ event, saveFormRef }: TabProps) {
  const setIsDirty = useSetAtom(areSettingsDirty);

  const form = useForm<z.infer<typeof EventGeneralInfoSchema>>({
    resolver: zodResolver(EventGeneralInfoSchema),
    defaultValues: {
      name: event.name,
      description: event.description ?? "",
      startDate: new Date(event.startDate),
      startTime: `${getHours(event.startDate).toString().padStart(2, "0")}:${getMinutes(event.startDate).toString().padStart(2, "0")}`,
      endDate: new Date(event.endDate),
      endTime: `${getHours(event.endDate).toString().padStart(2, "0")}:${getMinutes(event.endDate).toString().padStart(2, "0")}`,
      location: event.location ?? "",
      organizer: event.organizer ?? "",
    },
  });

  async function saveForm() {
    if (!(await form.trigger())) {
      return { success: false, event: null };
    }
    const values = form.getValues();
    values.startDate.setHours(Number.parseInt(values.startTime.split(":")[0]));
    values.startDate.setMinutes(
      Number.parseInt(values.startTime.split(":")[1]),
    );
    values.endDate.setHours(Number.parseInt(values.endTime.split(":")[0]));
    values.endDate.setMinutes(Number.parseInt(values.endTime.split(":")[1]));
    const newEvent = {
      ...event,
      name: values.name,
      description: values.description ?? "",
      startDate: formatISO9075(values.startDate, {
        representation: "complete",
      }),
      endDate: formatISO9075(values.endDate, { representation: "complete" }),
      location: values.location ?? "",
      organizer: values.organizer ?? "",
    };
    return { success: true, event: newEvent };
  }

  saveFormRef.current = saveForm;

  useEffect(() => {
    if (form.formState.isDirty) {
      setIsDirty(true);
    }
  }, [form.formState.isDirty, setIsDirty]);

  return (
    <Form {...form}>
      <form className="flex w-full flex-col flex-wrap gap-4">
        <div className="w-full space-y-4 sm:w-100">
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
          <div className="space-y-2">
            <FormLabel>Data i godzina rozpoczęcia</FormLabel>
            <div className="flex flex-row flex-wrap gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex grow flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="justify-start pl-3 text-left font-normal"
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        type="time"
                        {...field}
                      />
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
            <FormLabel>Data i godzina zakończenia</FormLabel>
            <div className="flex flex-row flex-wrap gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex grow flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="justify-start pl-3 text-left font-normal"
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500">
                      {form.formState.errors.endTime?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>
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
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Opis</FormLabel>
              <WysiwygEditor
                content={form.getValues("description") ?? "<p></p>"}
                onChange={field.onChange}
              />
              <FormMessage>
                {form.formState.errors.description?.message}
              </FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
