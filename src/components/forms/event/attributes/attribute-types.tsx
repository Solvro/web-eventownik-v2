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
  Smartphone,
  SquareDashedMousePointer,
} from "lucide-react";
import type { JSX } from "react";

import type { AttributeType } from "@/types/attributes";

export const ATTRIBUTE_TYPES: {
  value: AttributeType;
  title: string;
  description?: string;
  icon: JSX.Element;
}[] = [
  {
    value: "text",
    title: "Tekst",
    description: "Krótkie pole tekstowe",
    icon: <ALargeSmall />,
  },
  {
    value: "number",
    title: "Liczba",
    description: "Dozwolone jedynie liczby, nie litery",
    icon: <Binary />,
  },
  {
    value: "textarea",
    title: "Pole tekstowe",
    description: "Dłuższe pole tekstowe",
    icon: <LetterText />,
  },
  {
    value: "file",
    title: "Plik",
    description: "Przesłanie pliku każdego typu",
    icon: <CloudUpload />,
  },
  {
    value: "select",
    title: "Wybór",
    description: "Wybór 1 opcji spośród możliwych z listy rozwijanej",
    icon: <SquareDashedMousePointer />,
  },
  {
    value: "multiselect",
    title: "Wielokrotny wybór",
    description: "Wybór kilku opcji spośród możliwych",
    icon: <ListTodo />,
  },
  {
    value: "block",
    title: "Blok",
    description: "Zapisy na miejsca",
    icon: <Cuboid />,
  },
  {
    value: "date",
    title: "Data",
    description: "Dzień, miesiąc, rok",
    icon: <Calendar />,
  },
  {
    value: "time",
    title: "Czas",
    description: "Godzina i minuta",
    icon: <Clock />,
  },
  {
    value: "datetime",
    title: "Data i czas",
    description: "Dzień, miesiąc, rok, godzina, minuta",
    icon: <CalendarClock />,
  },
  {
    value: "email",
    title: "Email",
    description: "Wymagany format email",
    icon: <Mail />,
  },
  {
    value: "tel",
    title: "Telefon",
    description: "Wymagany format telefonu",
    icon: <Smartphone />,
  },
  {
    value: "color",
    title: "Kolor",
    description: "Podanie koloru w kodzie RGB, HSL, HEX",
    icon: <Palette />,
  },
  {
    value: "checkbox",
    title: "Pole wyboru",
    description: "Pole, które można zaznaczyć lub odznaczyć",
    icon: <Check />,
  },
];
