"use client";

import { subDays } from "date-fns";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { FormDateTimeField } from "@/components/date-time-field";
import { WysiwygEditor } from "@/components/editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { translateOrFallback } from "@/i18n/utils";
import { cn } from "@/lib/utils";

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
              {translateOrFallback(t, formState.errors.name?.message)}
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
              {translateOrFallback(t, formState.errors.location?.message)}
            </FormMessage>
          </FormItem>
        )}
      />
      <div className="row-span-2 flex flex-col gap-4">
        <FormDateTimeField
          control={control}
          formState={formState}
          label={t("startDateTime")}
          dateName={"startDate"}
          timeName={"startTime"}
        />

        <FormDateTimeField
          control={control}
          formState={formState}
          label={t("endDateTime")}
          dateName={"endDate"}
          timeName={"endTime"}
          disabled={(date) =>
            date <
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (getValues("startDate") === undefined
              ? subDays(new Date(), 1)
              : getValues("startDate"))
          }
        />
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
              {translateOrFallback(t, formState.errors.organizer?.message)}
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
              {translateOrFallback(t, formState.errors.contactEmail?.message)}
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
              {translateOrFallback(t, formState.errors.description?.message)}
            </FormMessage>
          </FormItem>
        )}
      />
    </div>
  );
}
