"use client";

import { Drawer, FieldLabel, Puck } from "@measured/puck";
import type {
  Config,
  Content,
  NumberField,
  Overrides,
  SelectField,
} from "@measured/puck";
import "@measured/puck/no-external.css";
import { AccordionItem } from "@radix-ui/react-accordion";
import {
  ALargeSmall,
  ChevronsRightLeft,
  ChevronsUpDown,
  Columns3,
  Mail,
  Rows3,
  Save,
  Sidebar,
  Type,
  User,
  X,
} from "lucide-react";

import {
  PUCK_ICON_CLASSNAME,
  withLayout,
  withTypography,
} from "@/components/editor/common";
import type {
  LayoutFields,
  TypographyFields,
} from "@/components/editor/common";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Definiuje pola dla tego komponentu i ich typy
interface HeadingFields extends TypographyFields {
  title: string;
  level: number;
}

interface ParagraphFields extends TypographyFields {
  content: string;
}

interface GridFields extends LayoutFields {
  content: Content;
  columns: number;
  columnGap: number;
  rows: number;
  rowGap: number;
}

interface FlexFields extends LayoutFields {
  content: Content;
  direction: "row" | "column";
  align: "start" | "center" | "end" | "stretch";
  justify: "start" | "center" | "end" | "stretch";
  gap: number;
}

interface Components {
  Heading: HeadingFields;
  Paragraph: ParagraphFields;
  Grid: GridFields;
  Flex: FlexFields;
}

function HeadingComponent({ title, level }: { title: string; level: number }) {
  switch (level) {
    case 1: {
      return <h1>{title}</h1>;
    }
    case 2: {
      return <h2>{title}</h2>;
    }
    case 3: {
      return <h3>{title}</h3>;
    }
    default: {
      return <h1>{title}</h1>;
    }
  }
}

export const config: Config<Components> = {
  components: {
    Heading: {
      label: "Nagłówek",
      fields: {
        title: {
          type: "textarea",
          contentEditable: true,
          label: "Treść",
          labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
        },
        level: {
          type: "select",
          label: "Stopień",
          labelIcon: <ALargeSmall className={PUCK_ICON_CLASSNAME} />,
          options: [
            {
              label: "1",
              value: 1,
            },
            {
              label: "2",
              value: 2,
            },
            {
              label: "3",
              value: 3,
            },
          ],
        },
        ...withTypography,
      },
      defaultProps: {
        title: "Nagłówek",
        level: 1,
        typography: {
          fontWeight: "700",
          textAlign: "left",
          fontSize: 24,
          color: "#000000",
        },
      },
      render: ({ level, title, typography }) => {
        return (
          <div
            style={{
              padding: 16,
              textAlign: typography.textAlign,
              fontWeight: typography.fontWeight,
              fontSize: typography.fontSize,
              color: typography.color,
            }}
          >
            <HeadingComponent level={level} title={title} />
          </div>
        );
      },
    },
    Paragraph: {
      label: "Akapit",
      fields: {
        content: {
          type: "textarea",
          contentEditable: true,
          label: "Treść",
          labelIcon: <Type className={PUCK_ICON_CLASSNAME} />,
        },
        ...withTypography,
      },
      defaultProps: {
        content: "Lorem ipsum dolor sit amet",
        typography: {
          fontWeight: "400",
          textAlign: "left",
          fontSize: 16,
          color: "#000000",
        },
      },
      render: ({ content, typography }) => {
        return (
          <div
            style={{
              padding: 16,
              textAlign: typography.textAlign,
              fontWeight: typography.fontWeight,
              fontSize: typography.fontSize,
              color: typography.color,
            }}
          >
            <p>{content}</p>
          </div>
        );
      },
    },
    Grid: {
      label: "Siatka",
      fields: {
        content: {
          type: "slot",
          label: "Bloki w kontenerze",
        },
        columns: {
          type: "number",
          label: "Kolumny",
          labelIcon: <Columns3 className={PUCK_ICON_CLASSNAME} />,
          min: 1,
          max: 6,
        },
        columnGap: {
          type: "number",
          label: "Odstęp - kolumny",
          labelIcon: <ChevronsRightLeft className={PUCK_ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        rows: {
          type: "number",
          label: "Rzędy",
          labelIcon: <Rows3 className={PUCK_ICON_CLASSNAME} />,
          min: 1,
          max: 6,
        },
        rowGap: {
          type: "number",
          label: "Odstęp - rzędy",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        ...withLayout,
      },
      render: ({
        content: Content,
        columns,
        columnGap,
        rows,
        rowGap,
        layout: { backgroundColor, backgroundImage, width, height },
      }) => {
        return (
          <Content
            style={{
              display: "grid",
              gridTemplateColumns: "1fr ".repeat(columns),
              columnGap,
              gridTemplateRows: "1fr ".repeat(rows),
              rowGap,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              width: `${width.toString()}%`,
              height: `${height.toString()}%`,
            }}
          />
        );
      },
      defaultProps: {
        columns: 2,
        columnGap: 16,
        rows: 1,
        rowGap: 16,
        content: [],
        layout: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "",
          width: 100,
          height: 100,
        },
      },
    },
    Flex: {
      label: "Flex",
      fields: {
        content: {
          type: "slot",
          label: "Bloki w kontenerze",
        },
        direction: {
          type: "select",
          label: "Kierunek",
          labelIcon: <ChevronsRightLeft className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "W prawo", value: "row" },
            { label: "W dół", value: "column" },
          ],
        },
        align: {
          type: "select",
          label: "Wyrównanie na osi głównej",
          labelIcon: <ChevronsRightLeft className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "Do lewej", value: "start" },
            { label: "Do środka", value: "center" },
            { label: "Do prawej", value: "end" },
            { label: "Do środka", value: "stretch" },
          ],
        },
        justify: {
          type: "select",
          label: "Wyrównanie na osi drugorzędnej",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "Do góry", value: "start" },
            { label: "Do środka", value: "center" },
            { label: "Do dołu", value: "end" },
            { label: "Do środka", value: "stretch" },
          ],
        },
        gap: {
          type: "number",
          label: "Odstęp między elementami",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        ...withLayout,
      },
      defaultProps: {
        direction: "row",
        align: "start",
        justify: "start",
        gap: 16,
        content: [],
        layout: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "",
          width: 100,
          height: 100,
        },
      },
      render: ({
        content: Content,
        direction,
        align,
        justify,
        gap,
        layout: { backgroundColor, backgroundImage, width, height },
      }) => {
        return (
          <Content
            style={{
              display: "flex",
              flexDirection: direction,
              alignItems: align,
              justifyContent: justify,
              gap,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              width,
              height,
            }}
          />
        );
      },
    },
  },
  categories: {
    typography: {
      title: "Tekst",
      components: ["Heading", "Paragraph"],
    },
    withLayout: {
      title: "Układ",
      components: ["Grid", "Flex"],
    },
  },
  root: {
    label: "Szablon",
    fields: {
      name: {
        type: "text",
        label: "Nazwa szablonu",
        labelIcon: <Mail className={PUCK_ICON_CLASSNAME} />,
      },
    },
  },
};

// Describe the initial data
const initialData = {};

// Component overrides
const overrides: Partial<Overrides> = {
  fieldTypes: {
    text: ({ onChange, name, value, field }) => (
      <>
        <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
        <Input
          type="text"
          value={value as string}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          className="text-foreground"
        />
      </>
    ),
    number: ({ onChange, name, value, field }) => {
      const typedField = field as NumberField;
      return (
        <>
          <FieldLabel
            label={typedField.label ?? name}
            icon={typedField.labelIcon}
          />
          <Input
            type="number"
            value={String(value ?? "")}
            // <input type="number"/> value is a string but Puck's API still expects a number
            onChange={(event) => {
              const next = event.currentTarget.value;
              onChange(next === "" ? undefined : Number(next));
            }}
            max={typedField.max}
            min={typedField.min}
            className="text-foreground"
          />
        </>
      );
    },
    select: ({ onChange, name, value, field }) => {
      const typedField = field as SelectField;
      return (
        <>
          <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
          <Select
            onValueChange={(selectValue) => {
              onChange(selectValue);
            }}
            defaultValue={value as string}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz opcję" />
            </SelectTrigger>
            <SelectContent>
              {typedField.options.map((option) => (
                <SelectItem
                  key={option.value as string}
                  // eslint-disable-next-line @typescript-eslint/no-base-to-string
                  value={option.value?.toString() ?? ""}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    },
    textarea: ({ onChange, name, value, field }) => (
      <>
        <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
        <Textarea
          value={value as string}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          className="text-foreground"
        />
      </>
    ),
  },
};

// Render Puck editor
export default function Editor() {
  return (
    <Puck
      config={config}
      data={initialData}
      overrides={{
        ...overrides,
        iframe: ({ children, document }) => {
          if (document !== undefined) {
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
            document.body.style.fontFamily = "Arial, system-ui, sans-serif";
          }
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{children}</>;
        },
      }}
      onPublish={(test) => {
        // eslint-disable-next-line no-console
        console.log(test);
      }}
    >
      <div className="mb-2 flex justify-between">
        <h1 className="mb-4 text-3xl font-bold">Edytor szablonu</h1>
        <Button variant="outline">
          <Save />
          Zapisz
        </Button>
      </div>
      <div className="border border-[var(--event-primary-color)]/50 bg-[var(--event-primary-color)]/10">
        <div className="flex justify-between border-b border-[var(--event-primary-color)]/50">
          <div>
            <Button variant="ghost">
              <Sidebar />
            </Button>
            <Button variant="ghost">
              <Sidebar className="scale-[-1_-1]" />
            </Button>
          </div>
        </div>
        <div className="grid min-h-[775px] grid-cols-[1fr_3fr_1fr] gap-4">
          <div className="space-y-4 border-r border-[var(--event-primary-color)]/50">
            <h2 className="border-b border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
              Bloki
            </h2>
            <Drawer>
              <Accordion type="multiple" className="px-4">
                {config.categories === undefined
                  ? null
                  : Object.keys(config.categories).map(
                      (category, categoryIndex) => {
                        const categoryLabel =
                          config.categories === undefined
                            ? null
                            : Object.values(config.categories)[categoryIndex]
                                .title;
                        const components =
                          config.categories === undefined
                            ? []
                            : (Object.values(config.categories)[categoryIndex]
                                .components ?? []);
                        return (
                          <AccordionItem value={category} key={category}>
                            <AccordionTrigger className="text-muted-foreground tracking-wider uppercase">
                              {categoryLabel}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2">
                              {components.map((component) => {
                                const componentLabel =
                                  config.components[component].label;
                                return (
                                  <Drawer.Item name={component} key={component}>
                                    {() => (
                                      <Button
                                        asChild
                                        size="sm"
                                        variant="eventDefault"
                                      >
                                        <div className="w-full py-2">
                                          {componentLabel}
                                        </div>
                                      </Button>
                                    )}
                                  </Drawer.Item>
                                );
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      },
                    )}
              </Accordion>
            </Drawer>
            <h2 className="border-y border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
              Schemat
            </h2>
            <div
              className={cn(
                // Outline list (ul - "_LayerTree")
                "[&>div>ul]:px-4!",
                // Outline list item (outer element - "_Layer")
                "[&>div>ul>li]:border-[var(--event-primary-color)]/20!",
                // Outline list item content (root element for each item - "_Layer-inner")
                "[&>div>ul>li>div]:text-foreground! [&>div>ul>li>div]:bg-[var(--event-primary-color)]/10! [&>div>ul>li>div:hover]:border-[var(--event-primary-color)]/60!",
                // Outline list item button (wrapper for items below - "_Layer-clickable")
                // Icon - "_Layer-icon")
                "[&>div>ul>li>div>button>div>div>svg]:mb-1! [&>div>ul>li>div>button>div>div>svg]:stroke-[var(--event-primary-color)]!",
                // Children of slot type component dropdown (as in layout blocks)
                "[&>div>ul>li>div:nth-child(2)>ul>li>div]:text-foreground! [&>div>ul>li>div:nth-child(2)>ul>li>div]:bg-[var(--event-primary-color)]/10! [&>div>ul>li>div:nth-child(2)>ul>li>div:hover]:border-[var(--event-primary-color)]/60!",
                "[&>div>ul>li>div:nth-child(2)>ul>li>div>button>div>div>svg]:mb-1! [&>div>ul>li>div:nth-child(2)>ul>li>div>button>div>div>svg]:stroke-[var(--event-primary-color)]!",
                // Background of slot type component dropdown ("BLOKI W KONTENERZE")
                "[&>div>ul>li>div:nth-child(2)]:bg-transparent!",
              )}
            >
              <Puck.Outline />
            </div>
          </div>
          <div className="my-4 flex flex-col gap-2 bg-white font-[system-ui]">
            <div className="flex items-center gap-2 px-14 py-2 text-xl text-black">
              <p>Tytuł wiadomości</p>
              <div className="flex items-center gap-2 rounded-md bg-slate-200 p-1 text-xs">
                Odebrane <X className="size-3 stroke-3 align-middle" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-4">
              <div className="rounded-full bg-slate-200 p-2">
                <User />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">
                  Nazwa wydarzenia
                  <span className="text-muted-foreground ml-2 font-normal">
                    {"<eventownik@solvro.pl>"}
                  </span>
                </p>
              </div>
            </div>
            <div className="max-w-7xl grow scale-[0.9]">
              <Puck.Preview />
            </div>
          </div>
          <div
            className={cn(
              "border-l border-[var(--event-primary-color)]/50",
              // Each field entry
              "[&>form>div]:border-[var(--event-primary-color)]/50!",
              // Field groups wrapper (commons)
              "[&>form>div:last-of-type>div>div>div:nth-of-type(2)]:border-none! [&>form>div:last-of-type>div>div>div:nth-of-type(2)]:bg-[var(--event-primary-color)]/2!",
            )}
          >
            <Puck.Fields />
          </div>
        </div>
      </div>
    </Puck>
  );
}
