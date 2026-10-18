/** Local input serialization; the API continues to carry JSON arrays. */
export function multiValues(raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const values: unknown = JSON.parse(trimmed);
      return Array.isArray(values)
        ? values.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  }
  return trimmed === "" ? [] : trimmed.split(",");
}
