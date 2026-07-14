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
  Layout,
  Minus,
  PaintBucket,
  Palette,
  PenLine,
  PenTool,
  Pipette,
  Ratio,
  SquareDashedTopSolid,
  SquareRoundCorner,
  SquareSquare,
  Type,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import type { LooseAutocomplete } from "@/types/utils";

import { ColorPicker } from "./color-picker";

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
        label: "Rozmiar czcionki",
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

export const withLayout = (t: ReturnType<typeof useTranslations>) =>
  ({
    layout: {
      type: "object",
      label: t("layout"),
      labelIcon: <Layout className={PUCK_ICON_CLASSNAME} />,
      objectFields: {
        margin: {
          label: t("margin"),
          labelIcon: <Ratio className={PUCK_ICON_CLASSNAME} />,
          type: "number",
        },
        padding: {
          label: t("padding"),
          labelIcon: <SquareSquare className={PUCK_ICON_CLASSNAME} />,
          type: "number",
        },
      },
    },
  }) as const satisfies CommonFieldsSchema;

export interface LayoutFields {
  layout: {
    margin: string;
    padding: string;
  };
}

export const getLayoutStyles = (layout: LayoutFields["layout"]) => {
  return {
    margin: `${layout.margin}px auto`,
    padding: `${layout.padding}px`,
  };
};

export const withAppearance = (t: ReturnType<typeof useTranslations>) =>
  ({
    appearance: {
      type: "object",
      label: t("appearance"),
      labelIcon: <Palette className={PUCK_ICON_CLASSNAME} />,
      objectFields: {
        color: {
          type: "custom",
          render: ({ name, onChange, value }) => (
            <FieldLabel
              label={t("textColor")}
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
              label={t("backgroundColor")}
              icon={<PaintBucket className={PUCK_ICON_CLASSNAME} />}
            >
              <ColorPicker onChange={onChange} value={value} name={name} />
            </FieldLabel>
          ),
        },
        // NOTE: Commented out until email content storage is implemented by the backend
        // image: {
        //   type: "object",
        //   label: "Obraz tła",
        //   labelIcon: <Image className={PUCK_ICON_CLASSNAME} />,
        //   objectFields: {
        //     backgroundImage: {
        //       type: "custom",
        //       label: "Obraz",
        //       render: ({ value, onChange }) => {
        //         // eslint-disable-next-line react-hooks/rules-of-hooks
        //         const fileInputRef = useRef<HTMLInputElement>(null);

        //         return (
        //           <div className="flex flex-col gap-2">
        //             <input
        //               type="file"
        //               accept="image/*"
        //               className="sr-only"
        //               aria-label="Wybierz obraz"
        //               ref={fileInputRef}
        //               onChangeCapture={async (event) => {
        //                 const input = event.target as HTMLInputElement;
        //                 const file = input.files?.[0];
        //                 if (file != null) {
        //                   const newBlobUrl = URL.createObjectURL(file);
        //                   const base64 = await getBase64FromUrl(newBlobUrl);
        //                   onChange(base64);
        //                   URL.revokeObjectURL(newBlobUrl);
        //                 }
        //               }}
        //             />

        //             <button
        //               type="button"
        //               onClick={() => fileInputRef.current?.click()}
        //               className="flex items-center gap-2 rounded border border-dashed! border-gray-500! px-3 py-2 text-sm hover:border-gray-400!"
        //             >
        //               <ImageIcon className={PUCK_ICON_CLASSNAME} />
        //               {value ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
        //             </button>

        //             {value ? (
        //               <div className="overflow-hidden rounded-md border border-gray-200">
        //                 {/* eslint-disable-next-line @next/next/no-img-element */}
        //                 <img
        //                   src={value}
        //                   alt=""
        //                   className="h-32 w-full bg-gray-50 object-contain"
        //                 />
        //               </div>
        //             ) : null}
        //           </div>
        //         );
        //       },
        //     },
        //     backgroundPosition: {
        //       type: "select",
        //       label: "Pozycja",
        //       labelIcon: <Move className={PUCK_ICON_CLASSNAME} />,
        //       options: [
        //         { label: "Góra", value: "top" },
        //         { label: "Dół", value: "bottom" },
        //         { label: "Lewo", value: "left" },
        //         { label: "Prawo", value: "right" },
        //         { label: "Środek", value: "center" },
        //       ],
        //     },
        //     backgroundSize: {
        //       type: "select",
        //       label: "Dopasowanie",
        //       labelIcon: <ImageUpscale className={PUCK_ICON_CLASSNAME} />,
        //       options: [
        //         { label: "Dopasuj", value: "contain" },
        //         { label: "Wypełnij", value: "cover" },
        //       ],
        //     },
        //     backgroundRepeat: {
        //       type: "select",
        //       label: "Powtarzanie",
        //       labelIcon: <Repeat className={PUCK_ICON_CLASSNAME} />,
        //       options: [
        //         { label: "Brak", value: "no-repeat" },
        //         { label: "Powtarzaj", value: "repeat" },
        //         { label: "Powtarzaj poziomo", value: "repeat-x" },
        //         { label: "Powtarzaj pionowo", value: "repeat-y" },
        //       ],
        //     },
        //   },
        // },
        border: {
          type: "object",
          label: t("border"),
          labelIcon: <SquareDashedTopSolid className={PUCK_ICON_CLASSNAME} />,
          objectFields: {
            borderWidth: {
              type: "number",
              label: t("borderWidth"),
              labelIcon: <Minus className={PUCK_ICON_CLASSNAME} />,
            },
            borderStyle: {
              type: "select",
              label: t("style"),
              labelIcon: <PenLine className={PUCK_ICON_CLASSNAME} />,
              options: [
                { label: t("none"), value: "none" },
                { label: t("solid"), value: "solid" },
                { label: t("dashed"), value: "dashed" },
                { label: t("dotted"), value: "dotted" },
                { label: t("double"), value: "double" },
              ],
            },
            borderColor: {
              type: "custom",
              render: ({ name, onChange, value }) => (
                <FieldLabel
                  label={t("color")}
                  icon={<Pipette className={PUCK_ICON_CLASSNAME} />}
                >
                  <ColorPicker onChange={onChange} value={value} name={name} />
                </FieldLabel>
              ),
            },
            borderRadius: {
              type: "number",
              label: t("borderRadius"),
              labelIcon: <SquareRoundCorner className={PUCK_ICON_CLASSNAME} />,
            },
          },
        },
      },
    },
  }) as const satisfies CommonFieldsSchema;

export interface AppearanceFields {
  appearance: {
    color: string;
    backgroundColor: string;
    // NOTE: Commented out until email content storage is implemented by the backend
    // image: {
    //   backgroundImage: string;
    //   backgroundPosition: string;
    //   backgroundSize: string;
    //   backgroundRepeat: string;
    // };
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
        }
      : {};

  return {
    backgroundColor: appearance.backgroundColor,
    // NOTE: Commented out until email content storage is implemented by the backend
    // backgroundImage: `url('${appearance.image.backgroundImage}')`,
    // backgroundPosition: appearance.image.backgroundPosition,
    // backgroundSize: appearance.image.backgroundSize,
    // backgroundRepeat: appearance.image.backgroundRepeat,
    color: appearance.color,
    borderRadius: `${appearance.border.borderRadius}px`,
    ...borderStyles,
  };
};

export const withContainer = (t: ReturnType<typeof useTranslations>) =>
  ({
    container: {
      type: "object",
      label: t("container"),
      labelIcon: <Container className={PUCK_ICON_CLASSNAME} />,
      objectFields: {
        verticalAlign: {
          label: t("alignment"),
          labelIcon: <AlignCenterHorizontal className={PUCK_ICON_CLASSNAME} />,
          type: "select",
          options: [
            { label: t("top"), value: "top" },
            { label: t("center"), value: "middle" },
            { label: t("bottom"), value: "bottom" },
          ],
        },
        borderSpacingHorizontal: {
          label: t("horizontalSpacing"),
          labelIcon: <ChevronsLeftRight className={PUCK_ICON_CLASSNAME} />,
          type: "number",
          min: 0,
          max: 100,
        },
        borderSpacingVertical: {
          label: t("verticalSpacing"),
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          type: "number",
          min: 0,
          max: 100,
        },
      },
    },
  }) as const satisfies CommonFieldsSchema;

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
    borderSpacing: `${container.borderSpacingHorizontal.toString()}px ${container.borderSpacingVertical.toString()}px`,
  };
};
