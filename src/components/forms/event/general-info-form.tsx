"use client";

import { format, subDays } from "date-fns";
import { CalendarArrowDownIcon, CalendarArrowUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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
import { getDateLocale, translateOrFallback } from "@/i18n/utils";
import { cn } from "@/lib/utils";

export type EventGeneralInfoErrors =
  | "nameRequired"
  | "startTimeRequired"
  | "endTimeRequired"
  | "endDateBeforeStartDate"
  | "invalidEmail";

export const EventGeneralInfoSchema = z
  .object({
    name: z.string().nonempty("nameRequired"),
    description: z.string().optional(),
    startDate: z.date(),
    startTime: z.string().nonempty("startTimeRequired"),
    endDate: z.date(),
    endTime: z.string().nonempty("endTimeRequired"),
    location: z.string().optional(),
    organizer: z.string().optional(),
    contactEmail: z.string().email("invalidEmail").or(z.literal("")).optional(),
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
      message: "endDateBeforeStartDate",
      path: ["endDate"],
    },
  );

export function GeneralInfoForm({ className }: { className?: string }) {
  const { control, formState, getValues } =
    useFormContext<z.infer<typeof EventGeneralInfoSchema>>();
  const t = useTranslations("EventDetails");
  const locale = useLocale();

  return (
    <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
      <FormField
        name="name"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder={t("enterEventName")}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,
                formState.errors.name?.message as EventGeneralInfoErrors,
              )}
            </FormMessage>
          </FormItem>
        )}
      />
      <FormField
        name="location"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("location")}</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder={t("enterEventLocation")}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,
                formState.errors.location?.message as EventGeneralInfoErrors,
              )}
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
                  <FormLabel>{t("startDateTime")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                          disabled={formState.isSubmitting}
                        >
                          {format(field.value, "PPP", {
                            locale: getDateLocale(locale),
                          })}
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
                        locale={getDateLocale(locale)}
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
            {translateOrFallback(
              t,
              formState.errors.startDate?.message as EventGeneralInfoErrors,
            )}
          </FormMessage>
          <FormMessage className="text-sm text-red-500">
            {translateOrFallback(
              t,
              formState.errors.startTime?.message as EventGeneralInfoErrors,
            )}
          </FormMessage>
        </div>
        <div className="space-y-2">
          <div className="flex flex-row flex-wrap items-end gap-4">
            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-1 flex-col">
                  <FormLabel>{t("endDateTime")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="pl-3 text-left font-normal"
                          disabled={formState.isSubmitting}
                        >
                          {format(field.value, "PPP", {
                            locale: getDateLocale(locale),
                          })}
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
                        locale={getDateLocale(locale)}
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
            {translateOrFallback(
              t,
              formState.errors.endDate?.message as EventGeneralInfoErrors,
            )}
          </FormMessage>
          <FormMessage className="text-sm text-red-500">
            {translateOrFallback(
              t,
              formState.errors.endTime?.message as EventGeneralInfoErrors,
            )}
          </FormMessage>
        </div>
      </div>
      <FormField
        name="organizer"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("organizer")}</FormLabel>
            <FormControl>
              <Input
                type="text"
                disabled={formState.isSubmitting}
                placeholder={t("enterEventOrganizer")}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,
                formState.errors.organizer?.message as EventGeneralInfoErrors,
              )}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        name="contactEmail"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("contactEmail")}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="example@example.org"
                disabled={formState.isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,
                formState.errors.contactEmail
                  ?.message as EventGeneralInfoErrors,
              )}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-full flex flex-col">
            <FormLabel>{t("description")}</FormLabel>
            <WysiwygEditor
              content={getValues("description") ?? ""}
              onChange={field.onChange}
              editorClassName="min-h-[150px] h-full"
              placeholder={t("eventDescrPlaceholder")}
            />
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,
                formState.errors.description?.message as EventGeneralInfoErrors,
              )}
            </FormMessage>
          </FormItem>
        )}
      />
    </div>
  );
}
