import type { Locale } from "date-fns";
import { enGB, pl } from "date-fns/locale";
import type { useTranslations } from "next-intl";

type TranslationFunction = ReturnType<typeof useTranslations>;
type TranslationKey = Parameters<TranslationFunction>[0];

export type EventDetailsKey = Parameters<
  ReturnType<typeof useTranslations<"EventDetails">>
>[0];

export type DashboardKey = Parameters<
  ReturnType<typeof useTranslations<"Dashboard">>
>[0];

export type TableKey = Parameters<
  ReturnType<typeof useTranslations<"Table">>
>[0];

export type ExportKey = Parameters<
  ReturnType<typeof useTranslations<"Export">>
>[0];

export type SendMailKey = Parameters<
  ReturnType<typeof useTranslations<"SendMail">>
>[0];

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

const DATE_FNS_LOCALES: Record<string, Locale> = {
  pl,
  en: enGB,
};

export function getDateLocale(locale: string): Locale {
  return DATE_FNS_LOCALES[locale] ?? enGB;
}
