"use client";

import { FieldLabel } from "@puckeditor/core";
import type { Field } from "@puckeditor/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  ChevronsUpDown,
  ExternalLink,
  FileSpreadsheet,
  ImageUpscale,
  Lightbulb,
  LinkIcon,
  Mail,
  Type,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";

import { EMAIL_TRIGGERS } from "@/lib/emails";
import { setupSuggestions } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import type { PuckConfig, RootSettings } from "@/types/editor";
import type { EventForm } from "@/types/forms";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  PUCK_ICON_CLASSNAME,
  withAppearance,
  withContainer,
  withLayout,
} from "./common";
import { InlineRichTextMenu, SidebarRichTextMenu } from "./richtext-menus";

interface EmailCSSProperties extends CSSProperties {
  msoTableLspace?: string;
  msoTableRspace?: string;
}

const tableStyle: EmailCSSProperties = {
  borderCollapse: "separate",
  msoTableLspace: "0pt",
  msoTableRspace: "0pt",
};

const tableProps = {
  cellPadding: "0",
  cellSpacing: "0",
  border: 0,
  tablelayout: "fixed",
};

const appearanceDefaults = {
  appearance: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
    image: {
      backgroundImage: "",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    },
  },
};

const layoutDefaults = {
  layout: {
    width: "auto",
    height: "auto",
    margin: "0",
    padding: "0",
  },
};

const containerDefaults = {
  container: {
    verticalAlign: "middle",
    borderSpacingHorizontal: 0,
    borderSpacingVertical: 0,
  },
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
        ...tableStyle,
        height: `${layout.height}%`,
        margin: `${layout.margin}px auto`,
        backgroundColor: appearance.backgroundColor,
        backgroundImage: `url('${appearance.image.backgroundImage}')`,
        backgroundPosition: appearance.image.backgroundPosition,
        backgroundSize: appearance.image.backgroundSize,
        backgroundRepeat: appearance.image.backgroundRepeat,
        color: appearance.color,
        padding: layout.padding,
        borderSpacing: `${container.borderSpacingHorizontal.toString()}px ${container.borderSpacingVertical.toString()}px`,
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
}: {
  tags: MessageTag[];
  forms: Pick<EventForm, "id" | "name">[];
}): PuckConfig => {
  return {
    components: {
      RichText: {
        label: "Tekst",
        fields: {
          content: {
            type: "richtext",
            label: "Zawartość",
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
            contentEditable: true,
            tiptap: {
              extensions: [
                Placeholder.configure({ placeholder: "Zacznij pisać..." }),
                ...setupSuggestions([...tags]),
              ],
            },
            renderInlineMenu: ({ editor }) => (
              <InlineRichTextMenu editor={editor} />
            ),
            renderMenu: ({ editor }) => <SidebarRichTextMenu editor={editor} />,
          },
        },
        defaultProps: {
          content: "<p></p>",
        },
        // eslint-disable-next-line react/jsx-no-useless-fragment
        render: ({ content }) => <>{content}</>,
      },
      TwoByOne: {
        label: "Siatka 2x1",
        fields: {
          left: {
            label: "Lewa",
            type: "slot",
          },
          right: {
            label: "Prawa",
            type: "slot",
          },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                    width: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <Left />
                </td>
                <td
                  style={{
                    width: "50%",
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
        label: "Siatka 3x1",
        fields: {
          left: {
            label: "Lewa",
            type: "slot",
          },
          center: {
            label: "Środkowa",
            type: "slot",
          },
          right: {
            label: "Prawa",
            type: "slot",
          },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                <td style={{ width: "33.33%" }}>
                  <Left />
                </td>
                <td style={{ width: "33.33%" }}>
                  <Center />
                </td>
                <td style={{ width: "33.33%" }}>
                  <Right />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      FourByOne: {
        label: "Siatka 4x1",
        fields: {
          col1: {
            label: "Kolumna 1",
            type: "slot",
          },
          col2: {
            label: "Kolumna 2",
            type: "slot",
          },
          col3: {
            label: "Kolumna 3",
            type: "slot",
          },
          col4: {
            label: "Kolumna 4",
            type: "slot",
          },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                <td style={{ width: "25%" }}>
                  <Col1 />
                </td>
                <td style={{ width: "25%" }}>
                  <Col2 />
                </td>
                <td style={{ width: "25%" }}>
                  <Col3 />
                </td>
                <td style={{ width: "25%" }}>
                  <Col4 />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      TwoByTwo: {
        label: "Siatka 2x2",
        fields: {
          topLeft: {
            label: "Górna lewa",
            type: "slot",
          },
          topRight: {
            label: "Górna prawa",
            type: "slot",
          },
          bottomLeft: {
            label: "Dolna lewa",
            type: "slot",
          },
          bottomRight: {
            label: "Dolna prawa",
            type: "slot",
          },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                    width: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopLeft />
                </td>
                <td
                  style={{
                    width: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "50%",
                    verticalAlign: container.verticalAlign,
                  }}
                >
                  <BottomLeft />
                </td>
                <td
                  style={{
                    width: "50%",
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
        label: "Siatka 3x2",
        fields: {
          topLeft: { label: "Górna lewa", type: "slot" },
          topCenter: { label: "Górna środkowa", type: "slot" },
          topRight: { label: "Górna prawa", type: "slot" },
          bottomLeft: { label: "Dolna lewa", type: "slot" },
          bottomCenter: { label: "Dolna środkowa", type: "slot" },
          bottomRight: { label: "Dolna prawa", type: "slot" },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                <td style={{ width: "33.33%" }}>
                  <TopLeft />
                </td>
                <td style={{ width: "33.33%" }}>
                  <TopCenter />
                </td>
                <td style={{ width: "33.33%" }}>
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td style={{ width: "33.33%" }}>
                  <BottomLeft />
                </td>
                <td style={{ width: "33.33%" }}>
                  <BottomCenter />
                </td>
                <td style={{ width: "33.33%" }}>
                  <BottomRight />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      ThreeByThree: {
        label: "Siatka 3x3",
        fields: {
          topLeft: { label: "Górna lewa", type: "slot" },
          topCenter: { label: "Górna środkowa", type: "slot" },
          topRight: { label: "Górna prawa", type: "slot" },
          middleLeft: { label: "Środkowa lewa", type: "slot" },
          middleCenter: { label: "Centrum", type: "slot" },
          middleRight: { label: "Środkowa prawa", type: "slot" },
          bottomLeft: { label: "Dolna lewa", type: "slot" },
          bottomCenter: { label: "Dolna środkowa", type: "slot" },
          bottomRight: { label: "Dolna prawa", type: "slot" },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
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
                <td style={{ width: "33.33%" }}>
                  <TopLeft />
                </td>
                <td style={{ width: "33.33%" }}>
                  <TopCenter />
                </td>
                <td style={{ width: "33.33%" }}>
                  <TopRight />
                </td>
              </tr>
              <tr>
                <td style={{ width: "33.33%" }}>
                  <MiddleLeft />
                </td>
                <td style={{ width: "33.33%" }}>
                  <MiddleCenter />
                </td>
                <td style={{ width: "33.33%" }}>
                  <MiddleRight />
                </td>
              </tr>
              <tr>
                <td style={{ width: "33.33%" }}>
                  <BottomLeft />
                </td>
                <td style={{ width: "33.33%" }}>
                  <BottomCenter />
                </td>
                <td style={{ width: "33.33%" }}>
                  <BottomRight />
                </td>
              </tr>
            </ContainerWrapper>
          );
        },
      },
      CustomContainer: {
        label: "Własny kontener",
        fields: {
          columns: {
            label: "Bloki w kontenerze",
            type: "array",
            arrayFields: {
              content: { label: "Blok", type: "slot" },
            },
            visible: false,
          },
          numZones: {
            label: "Liczba kolumn",
            type: "number",
            min: 2,
            max: 6,
          },
          ...withContainer,
          ...withLayout,
          ...withAppearance,
        },
        defaultProps: {
          columns: [],
          numZones: 2,
          ...layoutDefaults,
          ...appearanceDefaults,
          ...containerDefaults,
        },
        resolveData: (data, parameters) => {
          if (
            !(parameters.changed.numZones ?? false) ||
            data.props.numZones < 0
          ) {
            return data;
          }

          const newData = { ...data, props: { ...data.props } };
          newData.props.columns = [];

          // Rebuild slots based on numZones
          for (
            let iterator = 0;
            iterator < newData.props.numZones;
            iterator++
          ) {
            newData.props.columns.push(
              data.props.columns[iterator] ?? { content: [] },
            );
          }

          return newData;
        },
        render({ columns, layout, appearance, container }) {
          return (
            <ContainerWrapper
              layout={layout}
              appearance={appearance}
              container={container}
            >
              <tr>
                {columns.map(({ content: Content }, index) => (
                  <td key={index} className="min-w-16">
                    <Content />
                  </td>
                ))}
              </tr>
            </ContainerWrapper>
          );
        },
      },
      Divider: {
        label: "Odstęp",
        fields: {
          height: {
            type: "number",
            label: "Wysokość",
            labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          },
          ...withAppearance,
        },
        defaultProps: {
          height: "16",
          ...appearanceDefaults,
        },
        render({ height, appearance: { color, backgroundColor } }) {
          return (
            <table width="100%" {...tableProps} style={tableStyle}>
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
        label: "Obraz",
        fields: {
          src: {
            type: "text",
            label: "Adres URL",
            labelIcon: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
          },
          alt: {
            type: "text",
            label: "Tekst alternatywny",
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
          },
          objectFit: {
            type: "select",
            label: "Dopasowanie",
            labelIcon: <ImageUpscale className={PUCK_ICON_CLASSNAME} />,
            options: [
              { label: "Brak", value: "none" },
              { label: "Dopasuj", value: "contain" },
              { label: "Wypełnij", value: "cover" },
              { label: "Pomniejsz", value: "scale-down" },
            ],
          },
          ...withLayout,
        },
        defaultProps: {
          src: "",
          alt: "",
          objectFit: "contain",
          layout: {
            width: "128",
            height: "128",
            margin: "0",
            padding: "0",
          },
        },
        render({
          src,
          alt,
          objectFit,
          layout: { width, height, margin, padding },
        }) {
          return (
            <table width="100%" {...tableProps} style={tableStyle}>
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{ padding: `${padding}px`, margin: `${margin}px` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src === "" ? `/editor-image-placeholder.png` : src}
                      alt={alt}
                      width={width}
                      height={height}
                      style={{
                        display: "block",
                        objectFit,
                        width: `${width}px`,
                        height: `${height}px`,
                        maxWidth: "100%",
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
        label: "Link",
        fields: {
          title: {
            type: "text",
            label: "Tytuł",
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
          },
          href: {
            type: "text",
            label: "Odnośnik",
            labelIcon: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
          },
          target: {
            type: "radio",
            options: [
              { label: "Nowa karta", value: "_blank" },
              { label: "Aktualna karta", value: "_self" },
            ],
            label: "Zachowanie",
            labelIcon: <ExternalLink className={PUCK_ICON_CLASSNAME} />,
          },
          ...withAppearance,
        },
        defaultProps: {
          title: "Kliknij tutaj",
          href: "",
          target: "_blank",
          ...appearanceDefaults,
        },
        render({
          title,
          href,
          target,
          appearance: {
            color,
            backgroundColor,
            image: {
              backgroundImage,
              backgroundPosition,
              backgroundSize,
              backgroundRepeat,
            },
          },
        }) {
          return (
            <table width="100%" style={tableStyle}>
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{
                      width: "fit-content",
                    }}
                  >
                    <a
                      href={href}
                      target={target}
                      rel="noreferrer"
                      style={{
                        display: "block",
                        color,
                        backgroundColor,
                        backgroundImage: `url('${backgroundImage}')`,
                        backgroundPosition,
                        backgroundSize,
                        backgroundRepeat,
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
    },
    categories: {
      typography: {
        title: "Tekst",
        components: ["RichText"],
      },
      layout: {
        title: "Układ",
        components: [
          "TwoByOne",
          "ThreeByOne",
          "FourByOne",
          "TwoByTwo",
          "ThreeByTwo",
          "ThreeByThree",
          "CustomContainer",
          "Divider",
        ],
      },
      media: {
        title: "Media",
        components: ["Image", "Link"],
      },
    },
    root: {
      label: "Szablon",
      resolveFields: (data) => {
        const defaultFields: Record<
          keyof Omit<RootSettings, "triggerValue" | "triggerValue2">,
          Field<string>
        > = {
          name: {
            type: "text",
            label: "Nazwa szablonu",
            labelIcon: <Mail className={PUCK_ICON_CLASSNAME} />,
          },
          title: {
            type: "text",
            label: "Tytuł wiadomości",
            labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
          },
          trigger: {
            type: "custom",
            label: "Wyzwalacz",
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
                      <SelectValue placeholder="Wybierz opcję" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TRIGGERS.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-4 flex grow flex-col gap-2 rounded-md border border-(--event-primary-color)/25 p-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Lightbulb className="size-4" /> Wyjaśnienie
                    </div>
                    <p className="text-xs">
                      {EMAIL_TRIGGERS.find((t) => t.value === value)
                        ?.description ?? "Wybierz wyzwalacz..."}
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
              label: "Formularz",
              options: forms.map((form) => {
                return { label: form.name, value: form.id };
              }),
              labelIcon: <FileSpreadsheet className={PUCK_ICON_CLASSNAME} />,
            },
          };
        }

        return defaultFields;
      },
      defaultProps: {
        name: "",
        title: "",
        trigger: "manual",
      },
      render: ({ children }) => {
        return (
          <div
            id="email-root"
            style={{ width: "100%", backgroundColor: "#f3f4f6" }}
          >
            <table width="100%" {...tableProps} style={tableStyle}>
              <tbody>
                <tr>
                  <td align="center" style={{ padding: "20px 0" }}>
                    {/* Main Content Container - usually limited to 600px/640px for email */}
                    <table
                      width="600"
                      {...tableProps}
                      style={{
                        ...tableStyle,
                        backgroundColor: "#ffffff",
                        maxWidth: "100%",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td>{children}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      },
    },
  };
};
