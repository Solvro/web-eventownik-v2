"use client";

import { FieldLabel } from "@puckeditor/core";
import type { Config, Field, Slot } from "@puckeditor/core";
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
import type { EventForm } from "@/types/forms";
import type { LooseAutocomplete } from "@/types/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { AppearanceFields, LayoutFields } from "./common";
import { PUCK_ICON_CLASSNAME, withAppearance, withLayout } from "./common";
import { InlineRichTextMenu, SidebarRichTextMenu } from "./richtext-menus";

interface EmailCSSProperties extends CSSProperties {
  msoTableLspace?: string;
  msoTableRspace?: string;
}

const tableStyle: EmailCSSProperties = {
  borderCollapse: "collapse",
  msoTableLspace: "0pt",
  msoTableRspace: "0pt",
};

const tableProps = {
  cellPadding: "0",
  cellSpacing: "0",
  border: 0,
};

interface ImageFields extends LayoutFields {
  src: string;
  alt: string;
  objectFit: CSSProperties["objectFit"];
}

interface ContainerFields extends LayoutFields, AppearanceFields {
  columns: Record<"content", Slot>[];
  numZones: number;
}

interface DividerFields extends AppearanceFields {
  height: string;
}

interface RichTextFields {
  content: string;
}

interface LinkFields extends AppearanceFields {
  title: string;
  href: string;
  target: "_blank" | "_self";
}

export interface PuckComponents {
  RichText: RichTextFields;
  Container: ContainerFields;
  Divider: DividerFields;
  Image: ImageFields;
  Link: LinkFields;
}

interface RootSettings {
  name: string;
  title: string;
  trigger: LooseAutocomplete<(typeof EMAIL_TRIGGERS)[number]["value"]>;
  triggerValue?: string;
  triggerValue2?: string;
}

export type PuckConfig = Config<PuckComponents, RootSettings>;

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
      Container: {
        label: "Kontener",
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
          ...withLayout,
          ...withAppearance,
        },
        defaultProps: {
          columns: [],
          numZones: 2,
          layout: {
            width: "auto",
            height: "auto",
            margin: "0",
            padding: "0",
          },
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
        render({
          columns,
          layout: { margin, padding },
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
            <table
              width={"100%"}
              style={{
                ...tableStyle,
                margin: `${margin}px auto`,
                backgroundColor,
                backgroundImage: `url('${backgroundImage}')`,
                backgroundPosition,
                backgroundSize,
                backgroundRepeat,
                color,
                padding,
              }}
              {...tableProps}
            >
              <tbody>
                <tr>
                  {columns.map(({ content: Content }, index) => (
                    <td key={index} className="min-w-16">
                      <Content />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
        },
        render({
          title,
          href,
          target,
          appearance: { color, backgroundColor },
        }) {
          return (
            <table width="100%" {...tableProps} style={tableStyle}>
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: "20px 0",
                      color,
                      backgroundColor,
                      width: "fit-content",
                    }}
                  >
                    <a
                      href={href}
                      target={target}
                      rel="noreferrer"
                      style={{ display: "block" }}
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
        components: ["Container", "Divider"],
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
