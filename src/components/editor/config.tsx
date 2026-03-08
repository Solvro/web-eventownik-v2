"use client";

import { FieldLabel } from "@puckeditor/core";
import type { Field } from "@puckeditor/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  ChevronsLeftRight,
  ChevronsUpDown,
  ExternalLink,
  FileSpreadsheet,
  ImageIcon,
  ImageUpscale,
  Lightbulb,
  LinkIcon,
  Mail,
  Type,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { CSSProperties } from "react";

import { PHOTO_URL } from "@/lib/api";
import {
  appearanceDefaults,
  containerDefaults,
  layoutDefaults,
} from "@/lib/editor";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import { setupSuggestions } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getBase64FromUrl } from "@/lib/utils";
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
};

const tableProps = {
  cellPadding: "0",
  cellSpacing: "0",
  border: 0,
  tablelayout: "fixed",
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
  eventData,
}: {
  tags: MessageTag[];
  forms: Pick<EventForm, "id" | "name">[];
  eventData: PuckEventData;
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
            // NOTE: Hides inline menu and the action bar separator
            renderInlineMenu: () => <div className="[&~div]:hidden" />,
            renderMenu: ({ editor }) => <SidebarRichTextMenu editor={editor} />,
          },
          ...withAppearance,
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
            <table width="100%" {...tableProps} style={tableStyles}>
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
            type: "custom",
            label: "Obraz",
            render: ({ value, onChange }) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const fileInputRef = useRef<HTMLInputElement>(null);

              return (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
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
                    {value ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
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
          width: {
            label: "Szerokość",
            labelIcon: <ChevronsLeftRight className={PUCK_ICON_CLASSNAME} />,
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
                  Automatycznie
                </Button>
                <NumberButtonInput value={value} onChange={onChange} />
              </div>
            ),
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
          width: "128",
          height: "128",
          objectFit: "contain",
          layout: {
            margin: "0",
            padding: "0",
          },
        },
        render({ width, height, src, objectFit, layout: { margin, padding } }) {
          return (
            <table width="100%" {...tableProps} style={tableStyles}>
              <tbody>
                <tr>
                  <td
                    align="center"
                    style={{ padding: `${padding}px`, margin: `${margin}px` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src === "" ? `/editor-image-placeholder.svg` : src}
                      alt=""
                      width={width}
                      height={height}
                      style={{
                        display: "block",
                        objectFit,
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
            <table width="100%" style={tableStyles}>
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
            label: "Tytuł wiadomości",
            labelIcon: <Mail className={PUCK_ICON_CLASSNAME} />,
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
        name: "Nowa wiadomość",
        trigger: "manual",
      },
      //   return (
      //     <div
      //       id="email-root"
      //       style={{ width: "100%", backgroundColor: "#f3f4f6" }}
      //     >
      //       <table width="100%" {...tableProps} style={tableStyles}>
      //         <tbody>
      //           <tr>
      //             <td align="center" style={{ padding: "20px 0" }}>
      //               {/* Main Content Container - usually limited to 600px/640px for email */}
      //               <table
      //                 width="600"
      //                 {...tableProps}
      //                 style={{
      //                   ...tableStyles,
      //                   backgroundColor: "#ffffff",
      //                   maxWidth: "100%",
      //                 }}
      //               >
      //                 <tbody>
      //                   <tr>
      //                     <td className="border border-red-500">{children}</td>
      //                   </tr>
      //                 </tbody>
      //               </table>
      //             </td>
      //           </tr>
      //         </tbody>
      //       </table>
      //     </div>
      //   );
      // },
      render: ({ children, name }) => {
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
                  Odebrane <X className="size-3 stroke-3 align-middle" />
                </div>
              </div>
              <div className="pointer-events-none flex items-center gap-2">
                <Image
                  src={`${PHOTO_URL}/${eventData.photoUrl}`}
                  alt="Zdjęcie wydarzenia"
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
                style={{ backgroundColor: "#f3f4f6", ...tableStyles }}
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
                            <td style={{ backgroundColor: "#ffffff" }}>
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
