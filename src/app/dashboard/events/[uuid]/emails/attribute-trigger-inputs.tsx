"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { V3Attribute } from "@/types/v3";

export function AttributeTriggerInputs({
  attributes,
}: {
  attributes: Pick<V3Attribute, "uuid" | "name">[];
}) {
  const { control } = useFormContext<{
    triggerValue: string;
    triggerValue2: string;
  }>();
  const t = useTranslations("Editor");
  const tEvent = useTranslations("EventDetails");
  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="triggerValue"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("attribute")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {attributes.map((attribute) => (
                  <SelectItem key={attribute.uuid} value={attribute.uuid}>
                    {attribute.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage>
              {fieldState.error === undefined
                ? null
                : tEvent("triggerRequiresConfiguration")}
            </FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="triggerValue2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("value")}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
