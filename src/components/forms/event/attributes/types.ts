import type { AttributeOption } from "@/types/attributes";

// Local editor state: temporary IDs and selection controls are not API response fields.
export interface NewEventAttribute {
  config?: Record<string, unknown> | null;
  uuid?: string;
  name: string;
  slug: string | null;
  type: string;
  options: AttributeOption[] | null;
  showInList: boolean;
  order: number | null;
  isSensitiveData: boolean;
  reason: string | null;
  isMultiple: boolean;
  maxSelections: number | null;
}
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
