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
  ChevronsLeftRight,
  ChevronsUpDown,
  Image,
  Layout,
  Palette,
  PenTool,
  Ratio,
  SquareSquare,
  Type,
} from "lucide-react";

import { Input } from "../ui/input";
import { HybridInput } from "./hybrid-input";

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
        label: "Rozmiar czcionki ",
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
    labelIcon: <Layout className={PUCK_ICON_CLASSNAME} />,
    objectFields: {
      width: {
        label: "Szerokość",
        labelIcon: <ChevronsLeftRight className={PUCK_ICON_CLASSNAME} />,
        type: "custom",
        render: ({ name, onChange, value, field }) => (
          <>
            <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
            <HybridInput
              autoValue="auto"
              label="Automatycznie"
              type="number"
              value={value}
              onChange={onChange}
            />
          </>
        ),
      },
      height: {
        label: "Wysokość",
        labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
        type: "custom",
        render: ({ name, onChange, value, field }) => (
          <>
            <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
            <HybridInput
              autoValue="auto"
              label="Automatycznie"
              type="number"
              value={value}
              onChange={onChange}
              inputProps={{ min: "0", max: (10 ** 2).toString() }}
            />
          </>
        ),
      },
      margin: {
        label: "Margines zewnętrzny",
        labelIcon: <Ratio className={PUCK_ICON_CLASSNAME} />,
        type: "number",
      },
      padding: {
        label: "Margines wewnętrzny",
        labelIcon: <SquareSquare className={PUCK_ICON_CLASSNAME} />,
        type: "number",
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
    width: string;
    height: string;
    margin: string;
    padding: string;
    backgroundColor: string;
    backgroundImage: string;
  };
}
