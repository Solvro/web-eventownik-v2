"use client";

import { FieldLabel } from "@puckeditor/core";
import type { Field } from "@puckeditor/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import {
  ChevronsUpDown,
  FileSpreadsheet,
  ImageIcon,
  Lightbulb,
  LinkIcon,
  Mail,
  Palette,
  Scaling,
  Tag,
  Type,
  X,
  Zap,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import type { CSSProperties } from "react";

import { PHOTO_URL } from "@/lib/api";
import {
  appearanceDefaults,
  containerDefaults,
  layoutDefaults,
  rootDefaults,
} from "@/lib/editor";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import { setupSuggestions } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getBase64FromUrl } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";
import type { PuckConfig, PuckEventData, RootSettings } from "@/types/editor";
import type { EventForm } from "@/types/forms";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ColorPicker } from "./color-picker";
import {
  PUCK_ICON_CLASSNAME,
  getAppearanceStyles,
  getContainerStyles,
  getLayoutStyles,
  withAppearance,
  withContainer,
  withLayout,
} from "./common";
import { NumberButtonInput } from "./number-button-input";
import { SidebarRichTextMenu } from "./richtext-menu";

interface EmailCSSProperties extends CSSProperties {
  msoTableLspace?: string;
  msoTableRspace?: string;
}

const tableStyles: EmailCSSProperties = {
  borderCollapse: "separate",
  msoTableLspace: "0pt",
  msoTableRspace: "0pt",
  maxWidth: "100%",
  tableLayout: "fixed",
};

const tableProps = {
  cellPadding: "0",
  cellSpacing: "0",
  border: 0,
};

/**
 * A `<table>` element wrapper for each container block
 */
function ContainerWrapper({
  layout,
  appearance,
  container,
  children,
}: {
  layout: (typeof layoutDefaults)["layout"];
  appearance: (typeof appearanceDefaults)["appearance"];
  container: (typeof containerDefaults)["container"];
  children: React.ReactNode;
}) {
  return (
    <table
      width={"100%"}
      style={{
        ...tableStyles,
        ...getLayoutStyles(layout),
        ...getAppearanceStyles(appearance),
        ...getContainerStyles(container),
      }}
      {...tableProps}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

export const getPuckConfig = ({
  tags,
  forms,
  attributes,
  eventData,
  t,
}: {
  tags: MessageTag[];
  forms: Pick<EventForm, "id" | "name">[];
  attributes: Pick<EventAttribute, "id" | "name">[];
  eventData: PuckEventData;
  t: ReturnType<typeof useTranslations>;
}): PuckConfig => {
  return {
    components: {
      RichText: {
        label: t("text"),
        fields: {
          content: {
            type: "richtext",
            label: t("content"),
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
            contentEditable: true,
            tiptap: {
              extensions: [
                StarterKit.configure({
                  heading: {
                    HTMLAttributes: {
                      style: "margin: 0",
                    },
                  },
                  paragraph: {
                    HTMLAttributes: {
                      style: "margin: 0; min-height: 1em;",
                    },
                  },
                }),
                Placeholder.configure({ placeholder: t("startTyping") }),
                ...setupSuggestions([...tags]),
              ],
            },
            // NOTE: Hides the inline menu and the action bar separator
            renderInlineMenu: () => <div className="[&+div]:hidden" />,
            renderMenu: ({ editor }) => <SidebarRichTextMenu editor={editor} />,
          },
          ...withAppearance(t),
        },
        defaultProps: {
          content: "<p></p>",
          ...appearanceDefaults,
        },
        render: ({ content, appearance }) => {
          return (
            <div
              style={{
                ...getAppearanceStyles(appearance),
                padding: "0 4px",
              }}
            >
              {content}
            </div>
          );
        },
      },
      TwoByOne: {
        label: t("gridSize", { size: "2x1" }),
        fields: {
          left: {
            label: t("left"),
            type: "slot",
          },
          right: {
            label: t("right"),
            type: "slot",
          },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          left: [],
          right: [],
          ...layoutDefaults,
          ...appearanceDefaults,
          ...containerDefaults,
        },
        render({ left: Left, right: Right, layout, appearance, container }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Left />
                </td>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Right />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      ThreeByOne: {
        label: t("gridSize", { size: "3x1" }),
        fields: {
          left: {
            label: t("left"),
            type: "slot",
          },
          center: {
            label: t("middle"),
            type: "slot",
          },
          right: {
            label: t("right"),
            type: "slot",
          },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          left: [],
          center: [],
          right: [],
          ...containerDefaults,
          ...layoutDefaults,
          ...appearanceDefaults,
        },
        render({
          left: Left,
          center: Center,
          right: Right,
          layout,
          appearance,
          container,
        }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Left />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Center />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Right />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      FourByOne: {
        label: t("gridSize", { size: "4x1" }),
        fields: {
          col1: {
            label: t("column", { number: 1 }),
            type: "slot",
          },
          col2: {
            label: t("column", { number: 2 }),
            type: "slot",
          },
          col3: {
            label: t("column", { number: 3 }),
            type: "slot",
          },
          col4: {
            label: t("column", { number: 4 }),
            type: "slot",
          },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          col1: [],
          col2: [],
          col3: [],
          col4: [],
          ...containerDefaults,
          ...layoutDefaults,
          ...appearanceDefaults,
        },
        render({
          col1: Col1,
          col2: Col2,
          col3: Col3,
          col4: Col4,
          layout,
          appearance,
          container,
        }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "25%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Col1 />
                </td>
                <td
                  style={{
                    maxWidth: "25%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Col2 />
                </td>
                <td
                  style={{
                    maxWidth: "25%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Col3 />
                </td>
                <td
                  style={{
                    maxWidth: "25%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Col4 />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      TwoByTwo: {
        label: t("gridSize", { size: "2x2" }),
        fields: {
          topLeft: {
            label: t("topLeft"),
            type: "slot",
          },
          topRight: {
            label: t("topRight"),
            type: "slot",
          },
          bottomLeft: {
            label: t("bottomLeft"),
            type: "slot",
          },
          bottomRight: {
            label: t("bottomRight"),
            type: "slot",
          },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          topLeft: [],
          topRight: [],
          bottomLeft: [],
          bottomRight: [],
          ...layoutDefaults,
          ...appearanceDefaults,
          ...containerDefaults,
        },
        render({
          topLeft: TopLeft,
          topRight: TopRight,
          bottomLeft: BottomLeft,
          bottomRight: BottomRight,
          layout,
          appearance,
          container,
        }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopLeft />
                </td>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomLeft />
                </td>
                <td
                  style={{
                    maxWidth: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomRight />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      ThreeByTwo: {
        label: t("gridSize", { size: "3x2" }),
        fields: {
          topLeft: { label: t("topLeft"), type: "slot" },
          topCenter: { label: t("topCenter"), type: "slot" },
          topRight: { label: t("topRight"), type: "slot" },
          bottomLeft: { label: t("bottomLeft"), type: "slot" },
          bottomCenter: { label: t("bottomCenter"), type: "slot" },
          bottomRight: { label: t("bottomRight"), type: "slot" },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          topLeft: [],
          topCenter: [],
          topRight: [],
          bottomLeft: [],
          bottomCenter: [],
          bottomRight: [],
          ...containerDefaults,
          ...layoutDefaults,
          ...appearanceDefaults,
        },
        render({
          topLeft: TopLeft,
          topCenter: TopCenter,
          topRight: TopRight,
          bottomLeft: BottomLeft,
          bottomCenter: BottomCenter,
          bottomRight: BottomRight,
          layout,
          appearance,
          container,
        }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopLeft />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopCenter />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomLeft />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomCenter />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomRight />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      ThreeByThree: {
        label: t("gridSize", { size: "3x3" }),
        fields: {
          topLeft: { label: t("topLeft"), type: "slot" },
          topCenter: { label: t("topCenter"), type: "slot" },
          topRight: { label: t("topRight"), type: "slot" },
          middleLeft: { label: t("middleLeft"), type: "slot" },
          middleCenter: { label: t("middleCenter"), type: "slot" },
          middleRight: { label: t("middleRight"), type: "slot" },
          bottomLeft: { label: t("bottomLeft"), type: "slot" },
          bottomCenter: { label: t("bottomCenter"), type: "slot" },
          bottomRight: { label: t("bottomRight"), type: "slot" },
          ...withContainer(t),
          ...withLayout(t),
          ...withAppearance(t),
        },
        defaultProps: {
          topLeft: [],
          topCenter: [],
          topRight: [],
          middleLeft: [],
          middleCenter: [],
          middleRight: [],
          bottomLeft: [],
          bottomCenter: [],
          bottomRight: [],
          ...containerDefaults,
          ...layoutDefaults,
          ...appearanceDefaults,
        },
        render({
          topLeft: TopLeft,
          topCenter: TopCenter,
          topRight: TopRight,
          middleLeft: MiddleLeft,
          middleCenter: MiddleCenter,
          middleRight: MiddleRight,
          bottomLeft: BottomLeft,
          bottomCenter: BottomCenter,
          bottomRight: BottomRight,
          layout,
          appearance,
          container,
        }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopLeft />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopCenter />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <MiddleLeft />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <MiddleCenter />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <MiddleRight />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomLeft />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomCenter />
                </td>
                <td
                  style={{
                    maxWidth: "33.33%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomRight />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      Divider: {
        label: t("gap"),
        fields: {
          height: {
            type: "number",
            label: t("height"),
            labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          },
          ...withAppearance(t),
        },
        defaultProps: {
          height: "32",
          ...appearanceDefaults,
        },
        render({ height, appearance: { color, backgroundColor } }) {
          return (
            <table {...tableProps} style={tableStyles}>
              <tbody>
                <tr>
                  <td
                    height={height}
                    style={{
                      backgroundColor,
                      color,
                      fontSize: 0,
                      lineHeight: 0,
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          );
        },
      },
      Image: {
        label: t("image"),
        fields: {
          src: {
            type: "custom",
            label: t("image"),
            render: ({ value, onChange }) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fileInputRef = useRef<HTMLInputElement>(null);

              return (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label={t("selectImage")}
                    ref={fileInputRef}
                    onChangeCapture={async (event) => {
                      const input = event.target as HTMLInputElement;
                      if (input.files?.[0] != null) {
                        const newBlobUrl = URL.createObjectURL(input.files[0]);
                        const base64 = await getBase64FromUrl(newBlobUrl);
                        onChange(base64);
                        URL.revokeObjectURL(newBlobUrl);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded border border-dashed! border-gray-500! px-3 py-2 text-sm hover:border-gray-400!"
                  >
                    <ImageIcon className={PUCK_ICON_CLASSNAME} />
                    {value ? t("changeImage") : t("selectImage")}
                  </button>

                  {value ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={value}
                      alt=""
                      className="h-20 w-full rounded object-contain"
                    />
                  ) : null}
                </div>
              );
            },
          },
          size: {
            label: t("size"),
            labelIcon: <Scaling className={PUCK_ICON_CLASSNAME} />,
            type: "custom",
            render: ({ name, onChange, value, field }) => (
              <div className="space-y-2">
                <FieldLabel
                  label={field.label ?? name}
                  icon={field.labelIcon}
                />
                <Button
                  onClick={() => {
                    onChange("auto");
                  }}
                  variant={value === "auto" ? "secondary" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {t("automatically")}
                </Button>
                <NumberButtonInput value={value} onChange={onChange} />
              </div>
            ),
          },
          ...withLayout(t),
        },
        defaultProps: {
          src: "",
          size: "128",
          layout: {
            margin: "0",
            padding: "0",
          },
        },
        render({ size, src, layout: { margin, padding } }) {
          const sizeValue = size === "auto" ? "auto" : `${size}px`;
          return (
            <table width="100%" {...tableProps} style={tableStyles}>
              <tbody>
                <tr>
                  <td align="center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src === "" ? `/editor-image-placeholder.svg` : src}
                      alt=""
                      width={sizeValue === "auto" ? undefined : sizeValue}
                      style={{
                        display: "block",
                        objectFit: "contain",
                        width: sizeValue,
                        maxWidth: "100%",
                        padding: `${padding}px`,
                        margin: `${margin}px`,
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          );
        },
      },
      Link: {
        label: t("linkButton"),
        fields: {
          title: {
            type: "text",
            label: t("btnLabel"),
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
          },
          href: {
            type: "text",
            label: t("link"),
            labelIcon: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
          },
          ...withAppearance(t),
        },
        defaultProps: {
          title: t("clickHere"),
          href: "",
          appearance: {
            ...appearanceDefaults.appearance,
            backgroundColor: "#3571fd",
            color: "#fbfbfb",
          },
        },
        render({ title, href, appearance }) {
          return (
            <table width="100%" style={tableStyles}>
              <tbody>
                <tr>
                  <td align="center">
                    <a
                      href={href}
                      rel="noreferrer"
                      style={{
                        width: "fit-content",
                        display: "block",
                        padding: "0.5rem 1rem",
                        textDecoration: "none",
                        ...getAppearanceStyles(appearance),
                      }}
                    >
                      {title}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          );
        },
      },
      LinkImage: {
        label: t("linkedImage"),
        fields: {
          src: {
            type: "custom",
            label: t("image"),
            render: ({ value, onChange }) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fileInputRef = useRef<HTMLInputElement>(null);

              return (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label={t("selectImage")}
                    ref={fileInputRef}
                    onChangeCapture={async (event) => {
                      const input = event.target as HTMLInputElement;
                      if (input.files?.[0] != null) {
                        const newBlobUrl = URL.createObjectURL(input.files[0]);
                        const base64 = await getBase64FromUrl(newBlobUrl);
                        onChange(base64);
                        URL.revokeObjectURL(newBlobUrl);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded border border-dashed! border-gray-500! px-3 py-2 text-sm hover:border-gray-400!"
                  >
                    <ImageIcon className={PUCK_ICON_CLASSNAME} />
                    {value ? t("changeImage") : t("selectImage")}
                  </button>

                  {value ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={value}
                      alt=""
                      className="h-20 w-full rounded object-contain"
                    />
                  ) : null}
                </div>
              );
            },
          },
          size: {
            label: t("size"),
            labelIcon: <Scaling className={PUCK_ICON_CLASSNAME} />,
            type: "custom",
            render: ({ name, onChange, value, field }) => (
              <div className="space-y-2">
                <FieldLabel
                  label={field.label ?? name}
                  icon={field.labelIcon}
                />
                <Button
                  onClick={() => {
                    onChange("auto");
                  }}
                  variant={value === "auto" ? "secondary" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {t("automatically")}
                </Button>
                <NumberButtonInput value={value} onChange={onChange} />
              </div>
            ),
          },
          href: {
            type: "text",
            label: t("link"),
            labelIcon: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
          },
          ...withLayout(t),
        },
        defaultProps: {
          src: "",
          size: "128",
          href: "",
          layout: {
            margin: "0",
            padding: "0",
          },
        },
        render({ size, src, href, layout: { margin, padding } }) {
          const sizeValue = size === "auto" ? "auto" : `${size}px`;

          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src === "" ? `/editor-image-placeholder.svg` : src}
              alt=""
              width={sizeValue === "auto" ? undefined : sizeValue}
              style={{
                display: "block",
                objectFit: "contain",
                width: sizeValue,
                maxWidth: "100%",
                padding: `${padding}px`,
                margin: `${margin}px`,
              }}
            />
          );

          return (
            <table width="100%" {...tableProps} style={tableStyles}>
              <tbody>
                <tr>
                  <td align="center">
                    {href === "" ? (
                      image
                    ) : (
                      <a
                        href={href}
                        style={{ display: "block", width: "fit-content" }}
                      >
                        {image}
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          );
        },
      },
    },
    categories: {
      typography: {
        title: t("text"),
        components: ["RichText"],
      },
      layout: {
        title: t("layout"),
        components: [
          "TwoByOne",
          "ThreeByOne",
          "FourByOne",
          "TwoByTwo",
          "ThreeByTwo",
          "ThreeByThree",
          "Divider",
        ],
      },
      media: {
        title: t("media"),
        components: ["Image", "Link", "LinkImage"],
      },
    },
    root: {
      label: t("template"),
      resolveFields: (data) => {
        const defaultFields: Record<
          keyof Omit<RootSettings, "triggerValue" | "triggerValue2">,
          Field<string>
        > = {
          name: {
            type: "text",
            label: t("subject"),
            labelIcon: <Mail className={PUCK_ICON_CLASSNAME} />,
          },
          backgroundColor: {
            type: "custom",
            render: ({ name, onChange, value }) => (
              <FieldLabel
                label={t("backgroundColor")}
                icon={<Palette className={PUCK_ICON_CLASSNAME} />}
              >
                <ColorPicker
                  onChange={onChange}
                  value={value}
                  name={name}
                  allowDefault={false}
                />
              </FieldLabel>
            ),
          },
          trigger: {
            type: "custom",
            label: t("trigger"),
            labelIcon: <Zap className={PUCK_ICON_CLASSNAME} />,
            render: ({ name, onChange, value, field }) => {
              return (
                <>
                  <FieldLabel
                    label={field.label ?? name}
                    icon={field.labelIcon}
                  />
                  <Select
                    onValueChange={(selectValue) => {
                      onChange(selectValue);
                    }}
                    defaultValue={value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TRIGGERS.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-muted-foreground! mt-4 flex grow flex-col gap-2 rounded-md border border-(--event-primary-color)/25 p-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Lightbulb className="size-4" /> {t("explanation")}
                    </div>
                    <p className="text-xs">
                      {EMAIL_TRIGGERS.find((tr) => tr.value === value)
                        ?.description ?? t("selectTrigger")}
                    </p>
                  </div>
                </>
              );
            },
          },
        };

        if (data.props?.trigger === "form_filled") {
          return {
            ...defaultFields,
            triggerValue: {
              type: "select",
              label: t("form"),
              options: forms.map((form) => {
                return { label: form.name, value: form.id };
              }),
              labelIcon: <FileSpreadsheet className={PUCK_ICON_CLASSNAME} />,
            },
          };
        }

        if (data.props?.trigger === "attribute_changed") {
          return {
            ...defaultFields,
            triggerValue: {
              type: "select",
              label: t("attribute"),
              options: attributes.map((attribute) => {
                return { label: attribute.name, value: attribute.id };
              }),
              labelIcon: <Tag className={PUCK_ICON_CLASSNAME} />,
            },
            triggerValue2: {
              type: "text",
              label: t("value"),
              labelIcon: <Zap className={PUCK_ICON_CLASSNAME} />,
            },
          };
        }

        return defaultFields;
      },
      defaultProps: { ...rootDefaults, name: t("newMessage") },
      render: ({ children, name, backgroundColor }) => {
        const eventImageUrl =
          eventData.photoUrl === ""
            ? "/event-photo-placeholder.png"
            : `${PHOTO_URL}/${eventData.photoUrl}`;
        return (
          <div
            id="editor-root"
            // `#email-root` is sent with the email, that's why we apply editor only styling here
            className="size-full font-[system-ui] [&>div]:mx-auto [&>div]:max-w-2xl [&>div:nth-of-type(2)]:h-full"
          >
            <div className="mb-4 flex flex-col gap-2">
              <div className="pointer-events-none flex min-h-12 items-center gap-2 py-2 text-xl text-black">
                <p className="max-w-lg truncate text-2xl">{name}</p>
                <div className="flex items-center gap-2 rounded-md bg-slate-200 p-1 text-xs">
                  {t("received")} <X className="size-3 stroke-3 align-middle" />
                </div>
              </div>
              <div className="pointer-events-none flex items-center gap-2">
                <Image
                  src={eventImageUrl}
                  alt={t("eventImage")}
                  className="aspect-square rounded-full bg-slate-200"
                  width={32}
                  height={32}
                />
                <div>
                  <p className="text-sm font-semibold text-black">
                    {eventData.name}
                    <span className="text-muted-foreground ml-2 font-normal">
                      {"<eventownik@solvro.pl>"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div id="email-root" style={{ width: "100%" }}>
              <table
                width="100%"
                {...tableProps}
                style={{
                  backgroundColor,
                  ...tableStyles,
                }}
              >
                <tbody>
                  <tr>
                    <td align="center" style={{ padding: "20px 0" }}>
                      {/* Main Content Container - usually limited to 600px/640px for email */}
                      <table
                        width="600"
                        {...tableProps}
                        style={{
                          ...tableStyles,
                          maxWidth: "100%",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: "8px",
                                backgroundColor: "#ffffff",
                                maxWidth: "600px",
                              }}
                            >
                              {children}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      },
    },
  };
};
