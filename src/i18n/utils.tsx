import type { Locale } from "date-fns";
import { enGB, pl } from "date-fns/locale";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  pl,
  en: enGB,
};

export function getDateLocale(locale: string): Locale {
  return DATE_FNS_LOCALES[locale] ?? pl;
}
