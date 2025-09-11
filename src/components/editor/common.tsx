import { FieldLabel } from "@measured/puck";
import type {
  CustomField,
  NumberField,
  ObjectField,
  SelectField,
  TextField,
} from "@measured/puck";
import "@measured/puck/no-external.css";
import {
  AlignLeft,
  Bold,
  Columns3,
  Image,
  Palette,
  PenTool,
  Rows3,
  Type,
} from "lucide-react";

import { Input } from "../ui/input";

export const PUCK_ICON_CLASSNAME = "mr-1 size-5";

export type AllowedFields =
  | CustomField<string>
  | NumberField
  | ObjectField
  | SelectField
  | TextField;

export type CommonFieldsSchema = Record<
  string,
  Omit<ObjectField, "objectFields"> & {
    objectFields: Record<string, AllowedFields>;
  }
>;

export const withTypography = {
  typography: {
    type: "object",
    label: "Typografia",
    labelIcon: <PenTool className={PUCK_ICON_CLASSNAME} />,
    objectFields: {
      textAlign: {
        label: "Wyrównanie tekstu",
        labelIcon: <AlignLeft className={PUCK_ICON_CLASSNAME} />,
        type: "select",
        options: [
          { label: "Lewo", value: "left" },
          { label: "Środek", value: "center" },
          { label: "Prawo", value: "right" },
          { label: "Justuj", value: "justify" },
        ],
      },
      fontWeight: {
        label: "Grubość czcionki",
        labelIcon: <Bold className={PUCK_ICON_CLASSNAME} />,
        type: "select",
        options: [
          { label: "Cienka (300, Thin)", value: "300" },
          { label: "Normalna (400, Normal)", value: "400" },
          { label: "Wytłuszczona (500, Semibold)", value: "500" },
          { label: "Pogrubiona (700, Bold)", value: "700" },
          { label: "Bardzo gruba (900, Black)", value: "900" },
        ],
      },
      fontSize: {
        label: "Rozmiar czcionki (px)",
        labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
        type: "number",
        min: 1,
        max: 128,
      },
      color: {
        type: "custom",
        render: ({ name, onChange, value }) => (
          <FieldLabel
            label="Kolor tekstu"
            icon={<Palette className={PUCK_ICON_CLASSNAME} />}
          >
            <label
              htmlFor={name}
              className="border-input flex items-center justify-center gap-2 rounded-md border p-2"
            >
              <div
                className="aspect-square size-4 rounded-full border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <p>{value}</p>
            </label>
            <Input
              id={name}
              type="color"
              className="hidden"
              onChange={(event) => {
                onChange(event.currentTarget.value);
              }}
            />
          </FieldLabel>
        ),
      },
    },
  },
} as const satisfies CommonFieldsSchema;

export interface TypographyFields {
  typography: {
    textAlign: (typeof withTypography)["typography"]["objectFields"]["textAlign"]["options"][number]["value"];
    fontWeight: (typeof withTypography)["typography"]["objectFields"]["fontWeight"]["options"][number]["value"];
    fontSize: number;
    color: string;
  };
}

export const withLayout = {
  layout: {
    type: "object",
    label: "Układ",
    objectFields: {
      width: {
        label: "Szerokość (%)",
        labelIcon: <Columns3 className={PUCK_ICON_CLASSNAME} />,
        type: "number",
        min: 1,
        max: 100,
      },
      height: {
        label: "Wysokość (%)",
        labelIcon: <Rows3 className={PUCK_ICON_CLASSNAME} />,
        type: "number",
        min: 1,
        max: 100,
      },
      backgroundColor: {
        type: "custom",
        render: ({ name, onChange, value }) => (
          <FieldLabel
            label="Kolor tła"
            icon={<Palette className={PUCK_ICON_CLASSNAME} />}
          >
            <label
              htmlFor={name}
              className="border-input flex items-center justify-center gap-2 rounded-md border p-2"
            >
              <div
                className="aspect-square size-4 rounded-full border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <p>{value}</p>
            </label>
            <Input
              id={name}
              type="color"
              className="hidden"
              onChange={(event) => {
                onChange(event.currentTarget.value);
              }}
            />
          </FieldLabel>
        ),
      },
      backgroundImage: {
        type: "text",
        label: "Adres obrazu tła",
        labelIcon: <Image className={PUCK_ICON_CLASSNAME} />,
      },
    },
  },
} as const satisfies CommonFieldsSchema;

export interface LayoutFields {
  layout: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage: string;
  };
}
