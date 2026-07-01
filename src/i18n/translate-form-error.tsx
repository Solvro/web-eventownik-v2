import type { useTranslations } from "next-intl";

type TranslationFunction = ReturnType<typeof useTranslations>;
type TranslationKey = Parameters<TranslationFunction>[0];

export function translateFormError(
  t: TranslationFunction,
  errorMessage?: TranslationKey,
  values?: Record<string, string | number | Date>,
) {
  if (errorMessage !== undefined) {
    return t(errorMessage, values);
  }
}
