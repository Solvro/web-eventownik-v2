import {
  ALargeSmall,
  Binary,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  CloudUpload,
  Cuboid,
  LetterText,
  ListTodo,
  Mail,
  Palette,
  Pencil,
  Smartphone,
  SquareDashedMousePointer,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import type { JSX } from "react";

import type { AttributeType } from "@/types/attributes";

type AttributeTypesKeys = Parameters<
  ReturnType<typeof useTranslations<"AttributeTypes">>
>[0];

export const ATTRIBUTE_TYPES: {
  value: AttributeType;
  title: AttributeTypesKeys;
  description?: AttributeTypesKeys;
  icon: JSX.Element;
}[] = [
  {
    value: "text",
    title: "text",
    description: "textHint",
    icon: <ALargeSmall />,
  },
  {
    value: "number",
    title: "number",
    description: "numberHint",
    icon: <Binary />,
  },
  {
    value: "textarea",
    title: "textarea",
    description: "textareaHint",
    icon: <LetterText />,
  },
  {
    value: "file",
    title: "file",
    description: "fileHint",
    icon: <CloudUpload />,
  },
  {
    value: "drawing",
    title: "drawing",
    description: "drawingHint",
    icon: <Pencil />,
  },
  {
    value: "select",
    title: "select",
    description: "selectHint",
    icon: <SquareDashedMousePointer />,
  },
  {
    value: "multiselect",
    title: "multiselect",
    description: "multiselectHint",
    icon: <ListTodo />,
  },
  {
    value: "block",
    title: "block",
    description: "blockHint",
    icon: <Cuboid />,
  },
  {
    value: "date",
    title: "date",
    description: "dateHint",
    icon: <Calendar />,
  },
  {
    value: "time",
    title: "time",
    description: "timeHint",
    icon: <Clock />,
  },
  {
    value: "datetime",
    title: "datetime",
    description: "datetimeHint",
    icon: <CalendarClock />,
  },
  {
    value: "email",
    title: "email",
    description: "emailHint",
    icon: <Mail />,
  },
  {
    value: "tel",
    title: "phone",
    description: "phoneHint",
    icon: <Smartphone />,
  },
  {
    value: "color",
    title: "color",
    description: "colorHint",
    icon: <Palette />,
  },
  {
    value: "checkbox",
    title: "checkbox",
    description: "checkboxHint",
    icon: <Check />,
  },
];
