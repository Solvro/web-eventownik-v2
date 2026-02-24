"use client";

import { FieldLabel } from "@puckeditor/core";
import type {
  CustomField,
  NumberField,
  ObjectField,
  SelectField,
  TextField,
} from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import {
  AlignCenterHorizontal,
  AlignLeft,
  Bold,
  Brush,
  ChevronsLeftRight,
  ChevronsUpDown,
  Container,
  Image,
  ImageUpscale,
  Layout,
  LinkIcon,
  Minus,
  Move,
  PaintBucket,
  Palette,
  PenLine,
  PenTool,
  Pipette,
  Ratio,
  Repeat,
  Square,
  SquareRoundCorner,
  SquareSquare,
  Type,
} from "lucide-react";
import type { CSSProperties } from "react";

import type { LooseAutocomplete } from "@/types/utils";

import { Button } from "../ui/button";
import { ColorPicker } from "./color-picker";
import { NumberButtonInput } from "./number-button-input";

export const PUCK_ICON_CLASSNAME = "mr-1 size-5";

type TypedObjectField = Omit<ObjectField, "objectFields"> & {
  objectFields: Partial<
    Record<LooseAutocomplete<keyof CSSProperties>, AllowedFields>
  >;
};

type AllowedFields =
  | CustomField<string>
  | NumberField
  | TypedObjectField
  | SelectField
  | TextField;

type CommonFieldsSchema = Record<string, TypedObjectField>;

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
            <ColorPicker onChange={onChange} value={value} name={name} />
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
          <div className="space-y-2">
            <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
            <Button
              onClick={() => {
                onChange("auto");
              }}
              variant={value === "auto" ? "secondary" : "outline"}
              size="sm"
              className="w-full"
            >
              Automatycznie
            </Button>
            <NumberButtonInput value={value} onChange={onChange} />
          </div>
        ),
      },
      height: {
        label: "Wysokość",
        labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
        type: "custom",
        render: ({ name, onChange, value, field }) => (
          <div className="space-y-2">
            <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
            <Button
              onClick={() => {
                onChange("auto");
              }}
              variant={value === "auto" ? "secondary" : "outline"}
              size="sm"
              className="w-full"
            >
              Automatycznie
            </Button>
            <NumberButtonInput value={value} onChange={onChange} />
          </div>
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
    },
  },
} as const satisfies CommonFieldsSchema;

export interface LayoutFields {
  layout: {
    width: string;
    height: string;
    margin: string;
    padding: string;
  };
}

export const getLayoutStyles = (layout: LayoutFields["layout"]) => {
  return {
    width: `${layout.width}px`,
    height: `${layout.height}px`,
    margin: `${layout.margin}px auto`,
    padding: `${layout.padding}px`,
  };
};

export const withAppearance = {
  appearance: {
    type: "object",
    label: "Wygląd",
    labelIcon: <Palette className={PUCK_ICON_CLASSNAME} />,
    objectFields: {
      color: {
        type: "custom",
        render: ({ name, onChange, value }) => (
          <FieldLabel
            label="Kolor tekstu"
            icon={<Brush className={PUCK_ICON_CLASSNAME} />}
          >
            <ColorPicker onChange={onChange} value={value} name={name} />
          </FieldLabel>
        ),
      },
      backgroundColor: {
        type: "custom",
        render: ({ name, onChange, value }) => (
          <FieldLabel
            label="Kolor tła"
            icon={<PaintBucket className={PUCK_ICON_CLASSNAME} />}
          >
            <ColorPicker onChange={onChange} value={value} name={name} />
          </FieldLabel>
        ),
      },
      image: {
        type: "object",
        label: "Obraz tła",
        labelIcon: <Image className={PUCK_ICON_CLASSNAME} />,
        objectFields: {
          backgroundImage: {
            type: "text",
            label: "Adres URL",
            labelIcon: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
          },
          backgroundPosition: {
            type: "select",
            label: "Pozycja",
            labelIcon: <Move className={PUCK_ICON_CLASSNAME} />,
            options: [
              { label: "Góra", value: "top" },
              { label: "Dół", value: "bottom" },
              { label: "Lewo", value: "left" },
              { label: "Prawo", value: "right" },
              { label: "Środek", value: "center" },
            ],
          },
          backgroundSize: {
            type: "select",
            label: "Dopasowanie",
            labelIcon: <ImageUpscale className={PUCK_ICON_CLASSNAME} />,
            options: [
              { label: "Dopasuj", value: "contain" },
              { label: "Wypełnij", value: "cover" },
            ],
          },
          backgroundRepeat: {
            type: "select",
            label: "Powtarzanie",
            labelIcon: <Repeat className={PUCK_ICON_CLASSNAME} />,
            options: [
              { label: "Brak", value: "no-repeat" },
              { label: "Powtarzaj", value: "repeat" },
              { label: "Powtarzaj poziomo", value: "repeat-x" },
              { label: "Powtarzaj pionowo", value: "repeat-y" },
            ],
          },
        },
      },
      border: {
        type: "object",
        label: "Obramowanie",
        labelIcon: <Square className={PUCK_ICON_CLASSNAME} />,
        objectFields: {
          borderWidth: {
            type: "number",
            label: "Grubość",
            labelIcon: <Minus className={PUCK_ICON_CLASSNAME} />,
          },
          borderStyle: {
            type: "select",
            label: "Styl",
            labelIcon: <PenLine className={PUCK_ICON_CLASSNAME} />,
            options: [
              { label: "Brak", value: "none" },
              { label: "Ciągły", value: "solid" },
              { label: "Przerywany", value: "dashed" },
              { label: "Kropkowany", value: "dotted" },
              { label: "Podwójny", value: "double" },
            ],
          },
          borderColor: {
            type: "custom",
            render: ({ name, onChange, value }) => (
              <FieldLabel
                label="Kolor"
                icon={<Pipette className={PUCK_ICON_CLASSNAME} />}
              >
                <ColorPicker onChange={onChange} value={value} name={name} />
              </FieldLabel>
            ),
          },
          borderRadius: {
            type: "number",
            label: "Zaokrąglenie",
            labelIcon: <SquareRoundCorner className={PUCK_ICON_CLASSNAME} />,
          },
        },
      },
    },
  },
} as const satisfies CommonFieldsSchema;

export interface AppearanceFields {
  appearance: {
    color: string;
    backgroundColor: string;
    image: {
      backgroundImage: string;
      backgroundPosition: string;
      backgroundSize: string;
      backgroundRepeat: string;
    };
    border: {
      borderWidth: string;
      borderStyle: string;
      borderColor: string;
      borderRadius: string;
    };
  };
}

export const getAppearanceStyles = (
  appearance: AppearanceFields["appearance"],
) => {
  const borderStyles =
    Number.parseInt(appearance.border.borderWidth) > 0
      ? {
          border: `${appearance.border.borderWidth}px ${appearance.border.borderStyle} ${appearance.border.borderColor}`,
          borderRadius: `${appearance.border.borderRadius}px`,
        }
      : {};

  return {
    backgroundColor: appearance.backgroundColor,
    backgroundImage: `url('${appearance.image.backgroundImage}')`,
    backgroundPosition: appearance.image.backgroundPosition,
    backgroundSize: appearance.image.backgroundSize,
    backgroundRepeat: appearance.image.backgroundRepeat,
    color: appearance.color,
    ...borderStyles,
  };
};

export const withContainer = {
  container: {
    type: "object",
    label: "Kontener",
    labelIcon: <Container className={PUCK_ICON_CLASSNAME} />,
    objectFields: {
      verticalAlign: {
        label: "Komórki",
        labelIcon: <AlignCenterHorizontal className={PUCK_ICON_CLASSNAME} />,
        type: "select",
        options: [
          { label: "Do góry", value: "top" },
          { label: "Do środka", value: "middle" },
          { label: "Do dołu", value: "bottom" },
        ],
      },
      borderSpacingHorizontal: {
        label: "Odstęp poziomy",
        labelIcon: <ChevronsLeftRight className={PUCK_ICON_CLASSNAME} />,
        type: "number",
        min: 0,
        max: 100,
      },
      borderSpacingVertical: {
        label: "Odstęp pionowy",
        labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
        type: "number",
        min: 0,
        max: 100,
      },
    },
  },
} as const satisfies CommonFieldsSchema;

export interface ContainerFields {
  container: {
    verticalAlign: string;
    borderSpacingHorizontal: number;
    borderSpacingVertical: number;
  };
}

export const getContainerStyles = (container: ContainerFields["container"]) => {
  return {
    verticalAlign: container.verticalAlign,
    borderSpacingHorizontal: container.borderSpacingHorizontal.toString(),
    borderSpacingVertical: container.borderSpacingVertical.toString(),
  };
};
