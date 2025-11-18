import { ATTRIBUTE_TYPES } from "@/components/forms/event/attributes/attribute-types";
import { SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AttributeTypeOptions = () =>
  ATTRIBUTE_TYPES.map((type) => (
    <Tooltip key={type.value}>
      <TooltipTrigger asChild>
        <SelectItem value={type.value}>
          <div className="flex items-center gap-2">
            {type.icon}
            <span className="overflow-x-hidden text-ellipsis">
              {type.title}
            </span>
          </div>
        </SelectItem>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{type.description ?? type.title}</p>
      </TooltipContent>
    </Tooltip>
  ));
