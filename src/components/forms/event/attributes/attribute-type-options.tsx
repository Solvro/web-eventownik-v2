import { useTranslations } from "next-intl";

import { ATTRIBUTE_TYPES } from "@/components/forms/event/attributes/attribute-types";
import type { AttributeTypesKeys } from "@/components/forms/event/attributes/attribute-types";
import { SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AttributeTypeOptions() {
  const t = useTranslations("AttributeTypes");

  return ATTRIBUTE_TYPES.map((type) => (
    <Tooltip key={type.value}>
      <TooltipTrigger asChild>
        <SelectItem value={type.value}>
          <div className="flex items-center gap-2">
            {type.icon}
            <span className="overflow-x-hidden text-ellipsis">
              {t(type.title as AttributeTypesKeys)}
            </span>
          </div>
        </SelectItem>
      </TooltipTrigger>
      <TooltipContent side="left" className="pointer-coarse:hidden">
        <p>{t((type.description ?? type.title) as AttributeTypesKeys)}</p>
      </TooltipContent>
    </Tooltip>
  ));
}
