"use client";

import { format, subDays } from "date-fns";
import { CalendarArrowDownIcon, CalendarArrowUpIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { WysiwygEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
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
import { cn } from "@/lib/utils";

export const EventGeneralInfoSchema = z
  .object({
    name: z.string().nonempty("Nazwa nie może być pusta."),
    description: z.string().optional(),
    startDate: z.date(),
    startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
    endDate: z.date(),
    endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
    location: z.string().optional(),
    organizer: z.string().optional(),
    contactEmail: z
      .string()
      .email("Nieprawidłowy adres email")
      .or(z.literal(""))
      .optional(),
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

export function GeneralInfoForm({ className }: { className?: string }) {
  const { control, formState, getValues } =
    useFormContext<z.infer<typeof EventGeneralInfoSchema>>();

  return (
    <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
      <FormField
        name="name"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Nazwa</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder="Podaj nazwę wydarzenia"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.name?.message}
            </FormMessage>
          </FormItem>
        )}
      />
      <FormField
        name="location"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Miejsce</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder="Podaj miejsce wydarzenia"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.location?.message}
            </FormMessage>
          </FormItem>
        )}
      />
      <div className="row-span-2 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-row flex-wrap items-end gap-4">
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-1 flex-col">
                  <FormLabel>Data i godzina rozpoczęcia</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                          disabled={formState.isSubmitting}
                        >
                          {format(field.value, "PPP")}
                          <CalendarArrowDownIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        aria-label="Kalendarz daty rozpoczęcia"
                        className="z-50"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= subDays(new Date(), 1)}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Input
                      disabled={formState.isSubmitting}
                      type="time"
                      aria-label="Godzina rozpoczęcia"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormMessage className="text-sm text-red-500">
            {formState.errors.startDate?.message}
          </FormMessage>
          <FormMessage className="text-sm text-red-500">
            {formState.errors.startTime?.message}
          </FormMessage>
        </div>
        <div className="space-y-2">
          <div className="flex flex-row flex-wrap items-end gap-4">
            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-1 flex-col">
                  <FormLabel>Data i godzina zakończenia</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                          disabled={formState.isSubmitting}
                        >
                          {format(field.value, "PPP")}
                          <CalendarArrowUpIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        aria-label="Kalendarz daty zakończenia"
                        className="z-50"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date <
                          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                          (getValues("startDate") === undefined
                            ? subDays(new Date(), 1)
                            : getValues("startDate"))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Input
                      disabled={formState.isSubmitting}
                      type="time"
                      aria-label="Godzina zakończenia"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormMessage className="text-sm text-red-500">
            {formState.errors.endDate?.message}
          </FormMessage>
          <FormMessage className="text-sm text-red-500">
            {formState.errors.endTime?.message}
          </FormMessage>
        </div>
      </div>
      <FormField
        name="organizer"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Organizator</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder="Podaj organizatora wydarzenia"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.organizer?.message}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        name="contactEmail"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Email do kontaktu</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="example@example.org"
                disabled={formState.isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.contactEmail?.message}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-full flex flex-col">
            <FormLabel>Opis</FormLabel>
            <WysiwygEditor
              content={getValues("description") ?? ""}
              onChange={field.onChange}
              editorClassName="min-h-[150px] h-full"
            />
            <FormMessage>{formState.errors.description?.message}</FormMessage>
          </FormItem>
        )}
      />
    </div>
  );
}
