import type { useTranslations } from "next-intl";

type TranslationFunction = ReturnType<typeof useTranslations>;
type TranslationKey = Parameters<TranslationFunction>[0];

export function translateOrFallback(
  t: TranslationFunction,
  message?: string,
  values?: Record<string, string | number | Date>,
) {
  if (message !== undefined) {
    const key = message as TranslationKey;
    return t.has(key) ? t(key, values) : message;
  }
}
