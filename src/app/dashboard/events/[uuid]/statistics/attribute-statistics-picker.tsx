"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAttributeLabel } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";

export function AttributeStatisticsPicker({
  attributes,
  value,
  onSelect,
}: {
  attributes: EventAttribute[];
  value: string | undefined;
  onSelect: (attributeUuid: string) => void;
}) {
  const t = useTranslations("Statistics");
  const locale = useLocale();

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-full max-w-64">
        <SelectValue placeholder={t("attributePlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        {attributes.map((attribute) => (
          <SelectItem key={attribute.uuid} value={attribute.uuid}>
            {getAttributeLabel(attribute.name, locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
