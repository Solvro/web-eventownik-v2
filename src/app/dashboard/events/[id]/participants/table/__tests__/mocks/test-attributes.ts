import type { Attribute } from "@/types/attributes";

export type TestAttribute = Omit<
  Attribute,
  "isRequired" | "isEditable" | "isMultiple" | "maxSelections"
>;

export function toAttributes(attributes: TestAttribute[]): Attribute[] {
  return attributes.map((attribute) => ({
    ...attribute,
    isRequired: false,
    isEditable: true,
    isMultiple: false,
    maxSelections: null,
  }));
}
