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

export const EventGeneralInfoSchema = z.object({
  name: z.string().nonempty("Nazwa nie może być pusta."),
  description: z.string().optional(),
  startDate: z.date(),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endDate: z.date(),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  location: z.string().optional(),
  organizer: z.string().optional(),
});

export function GeneralInfoForm() {
  const { control, formState, getValues } =
    useFormContext<z.infer<typeof EventGeneralInfoSchema>>();

  return (
    <div className="flex w-full flex-col items-end gap-4">
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <div className="w-full space-y-4">
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
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-end gap-4">
              <FormField
                control={control}
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
            <FormLabel>Data i godzina zakończenia</FormLabel>
            <div className="flex flex-row gap-4">
              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-[240px] pl-3 text-left font-normal"
                            disabled={formState.isSubmitting}
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
        <div>
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Opis</FormLabel>
                <WysiwygEditor
                  content={getValues("description") ?? ""}
                  onChange={field.onChange}
                />
                <FormMessage>
                  {formState.errors.description?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-4">
        <FormField
          name="location"
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Miejsce (opcjonalnie)</FormLabel>
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
        <FormField
          name="organizer"
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Organizator (opcjonalnie)</FormLabel>
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
      </div>
    </div>
  );
}
