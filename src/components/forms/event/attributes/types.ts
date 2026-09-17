import type { EventAttribute } from "@/types/attributes";

/**
 * TODO(refactor): Duplicate of `AttributeFormData` in `.../settings/tabs/attributes.tsx`
 */
export type NewEventAttribute = Pick<
  EventAttribute,
  | "name"
  | "slug"
  | "type"
  | "options"
  | "showInList"
  | "order"
  | "isSensitiveData"
  | "reason"
  | "isMultiple"
  | "maxSelections"
> & { uuid?: string };

export interface AttributeItemProps {
  attribute: NewEventAttribute;
  index: number;
  onUpdateItem?: (index: number, value: NewEventAttribute) => void;
}

export interface SortableAttributeItemProps extends AttributeItemProps {
  uuid: string;
  onRemove: () => void;
}

export interface SortableOptionProps {
  option: string;
  index: number;
  onRemove: (option: string) => void;
}
