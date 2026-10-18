import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { GeneralInfoForm } from "@/components/forms/event/general-info-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export const EventVisibilitySchema = z.object({ isPublic: z.boolean() });

function EventVisibilityField() {
  const t = useTranslations("Dashboard");
  const { control } = useFormContext<z.infer<typeof EventVisibilitySchema>>();

  return (
    <FormField
      name="isPublic"
      control={control}
      render={({ field }) => (
        <FormItem className="flex max-w-3xl flex-row items-center justify-between gap-4 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <FormLabel>{t("eventVisibility")}</FormLabel>
            <FormDescription>{t("eventVisibilityDescription")}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function General() {
  return (
    <div className="flex flex-col gap-6">
      <GeneralInfoForm className="max-w-3xl md:grid-cols-1 lg:grid-cols-2" />
      <EventVisibilityField />
    </div>
  );
}
