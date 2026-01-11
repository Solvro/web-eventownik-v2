import type { EventAttribute } from "@/types/attributes";

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
> & { id?: number };

export interface AttributeItemProps {
  attribute: NewEventAttribute;
  index: number;
  onUpdateItem?: (index: number, value: NewEventAttribute) => void;
}

export interface SortableAttributeItemProps extends AttributeItemProps {
  id: string;
  onRemove: () => void;
}

export interface SortableOptionProps {
  option: string;
  onRemove: (option: string) => void;
}
