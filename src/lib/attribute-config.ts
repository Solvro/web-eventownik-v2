import type { V3Attribute } from "@/types/v3";

export function attributeOptions(attribute: V3Attribute): string[] {
  const options = attribute.config?.options;
  return Array.isArray(options)
    ? options.filter((value): value is string => typeof value === "string")
    : [];
}
export function attributeMaxSelections(attribute: V3Attribute): number | null {
  const value = attribute.config?.maxSelections;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}
export function attributeIsMultiple(attribute: V3Attribute): boolean {
  return (
    attribute.type === "multiSelect" ||
    (attribute.type === "block" && (attributeMaxSelections(attribute) ?? 1) > 1)
  );
}
