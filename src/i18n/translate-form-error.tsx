import type { useTranslations } from "next-intl";

type TranslationFunction = ReturnType<typeof useTranslations>;
type TranslationKey = Parameters<TranslationFunction>[0];

export function translateFormError(
  t: TranslationFunction,
  errorMessage?: string,
  values?: Record<string, string | number | Date>,
) {
  if (errorMessage !== undefined) {
    const key = errorMessage as TranslationKey;
    return t.has(key) ? t(key, values) : errorMessage;
  }
}
