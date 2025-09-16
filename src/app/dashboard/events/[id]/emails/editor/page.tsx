"use client";

import { FieldLabel, Puck } from "@measured/puck";
import type {
  Config,
  Content,
  NumberField,
  Overrides,
  SelectField,
} from "@measured/puck";
import "@measured/puck/no-external.css";
import {
  ALargeSmall,
  ChevronsRightLeft,
  ChevronsUpDown,
  Columns3,
  Mail,
  Rows3,
  Type,
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
import { PuckComposition } from "@/components/editor/composition";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
              textAlign: typography.textAlign,
              fontWeight: typography.fontWeight,
              fontSize: typography.fontSize,
              color: typography.color,
            }}
          >
            {/* NOTE: We render the paragraph with additional padding, so that the "bubble" is not cut off.
                This is not reflected in the document schema, though it creates a visual mismatch
                between what you see in the editor and what gets sent to the user
            */}
            <p className="p-4">{content}</p>
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
          type: "text",
          label: "Odstęp - kolumny",
          labelIcon: <ChevronsRightLeft className={PUCK_ICON_CLASSNAME} />,
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
        layout: {
          backgroundColor,
          backgroundImage,
          width,
          height,
          margin,
          padding,
        },
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
              width: `${width}px`,
              height: `${height}px`,
              margin: `${margin}px`,
              padding: `${padding}px`,
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
          width: "auto",
          height: "auto",
          margin: "0",
          padding: "0",
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
          width: "auto",
          height: "auto",
          margin: "0",
          padding: "0",
        },
      },
      render: ({
        content: Content,
        direction,
        align,
        justify,
        gap,
        layout: {
          backgroundColor,
          backgroundImage,
          width,
          height,
          margin,
          padding,
        },
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
              width: `${width}px`,
              height: `${height}px`,
              margin: `${margin}px`,
              padding: `${padding}px`,
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
      <PuckComposition config={config} />
    </Puck>
  );
}
