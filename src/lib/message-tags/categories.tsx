import { Calendar, FileSpreadsheet, Tag, User } from "lucide-react";
import { useTranslations } from "next-intl";

export const CATEGORY_ICON_CLASSNAME = "size-4";

export interface MessageTagCategory {
  title: string;
  searchBy: string[];
  icon: React.ReactNode;
}

export function getCategories(
  t: ReturnType<typeof useTranslations<"MessageTags">>,
) {
  return {
    event: {
      title: t("event"),
      searchBy: ["wydarzenie", "event"],
      icon: <Calendar className={CATEGORY_ICON_CLASSNAME} />,
    },
    participant: {
      title: t("participant"),
      searchBy: ["uczestnik", "participant"],
      icon: <User className={CATEGORY_ICON_CLASSNAME} />,
    },
    attribute: {
      title: t("attribute"),
      searchBy: ["atrybut", "attribute"],
      icon: <Tag className={CATEGORY_ICON_CLASSNAME} />,
    },
    form: {
      title: t("form"),
      searchBy: ["formularz", "form"],
      icon: <FileSpreadsheet className={CATEGORY_ICON_CLASSNAME} />,
    },
  };
}
