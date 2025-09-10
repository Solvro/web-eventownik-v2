"use client";

import { FieldLabel, Puck } from "@measured/puck";
import type {
  Config,
  Content,
  CustomField,
  NumberField,
  RadioField,
  SelectField,
} from "@measured/puck";
import "@measured/puck/no-external.css";
import {
  ALargeSmall,
  AlignLeft,
  Bold,
  ChevronsRightLeft,
  ChevronsUpDown,
  Columns3,
  Palette,
  Rows3,
  Type,
} from "lucide-react";
import type React from "react";

const ICON_CLASSNAME = "mr-1 size-5";

// Definiuje konfiguracje pól + pełen autocomplete dla możliwych property
const typography = {
  textAlign: {
    label: "Wyrównanie tekstu",
    labelIcon: <AlignLeft className={ICON_CLASSNAME} />,
    type: "radio",
    options: [
      { label: "Lewo", value: "left" },
      { label: "Środek", value: "center" },
      { label: "Prawo", value: "right" },
      { label: "Justuj", value: "justify" },
    ],
  },
  fontWeight: {
    label: "Grubość czcionki",
    labelIcon: <Bold className={ICON_CLASSNAME} />,
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
    labelIcon: <Type className={ICON_CLASSNAME} />,
    type: "number",
    min: 1,
    max: 128,
  },
  color: {
    type: "custom",
    render: ({ name, onChange, value }) => (
      <FieldLabel
        label="Kolor tekstu"
        icon={<Palette className={ICON_CLASSNAME} />}
      >
        <input
          defaultValue={value}
          name={name}
          type="color"
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
        />
      </FieldLabel>
    ),
  },
} as const satisfies Record<
  string,
  RadioField | SelectField | NumberField | CustomField<string>
>;

// Definiuje wartości jakie może przyjąć pole
interface WithTypography {
  textAlign: (typeof typography)["textAlign"]["options"][number]["value"];
  fontWeight: (typeof typography)["fontWeight"]["options"][number]["value"];
  fontSize: number;
  color: string;
}

// Definiuje pola dla tego komponentu i ich typy
interface HeadingFields extends WithTypography {
  title: string;
  level: number;
}

interface ParagraphFields extends WithTypography {
  content: string;
}

interface Components {
  Heading: HeadingFields;
  Paragraph: ParagraphFields;
  Grid: {
    content: Content;
    columns: number;
    columnGap: number;
    rows: number;
    rowGap: number;
  };
  Flex: {
    content: Content;
    direction: "row" | "column";
    align: "start" | "center" | "end" | "stretch";
    justify: "start" | "center" | "end" | "stretch";
    gap: number;
  };
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
          type: "text",
          label: "Treść",
          labelIcon: <Type className={ICON_CLASSNAME} />,
        },
        level: {
          type: "select",
          label: "Stopień",
          labelIcon: <ALargeSmall className={ICON_CLASSNAME} />,
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
        ...typography,
      },
      defaultProps: {
        title: "Nagłówek",
        level: 1,
        fontWeight: "400",
        textAlign: "left",
        fontSize: 24,
        color: "#FFFFFF",
      },
      render: ({ level, title, textAlign, fontWeight, fontSize, color }) => {
        return (
          <div style={{ padding: 16, textAlign, fontWeight, fontSize, color }}>
            <HeadingComponent level={level} title={title} />
          </div>
        );
      },
    },
    Paragraph: {
      label: "Paragraf",
      fields: {
        content: {
          type: "text",
          label: "Treść",
          labelIcon: <Type className={ICON_CLASSNAME} />,
        },
        ...typography,
      },
      defaultProps: {
        content: "Lorem ipsum dolor sit amet",
        textAlign: "left",
        fontWeight: "400",
        fontSize: 14,
        color: "#FFFFFF",
      },
      render: ({ content, textAlign, fontWeight, fontSize, color }) => {
        return (
          <div style={{ padding: 16, textAlign, fontWeight, fontSize, color }}>
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
          labelIcon: <Columns3 className={ICON_CLASSNAME} />,
          min: 1,
          max: 6,
        },
        columnGap: {
          type: "number",
          label: "Odstęp między kolumnami",
          labelIcon: <ChevronsRightLeft className={ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        rows: {
          type: "number",
          label: "Rzędy",
          labelIcon: <Rows3 className={ICON_CLASSNAME} />,
          min: 1,
          max: 6,
        },
        rowGap: {
          type: "number",
          label: "Odstęp między rzędami",
          labelIcon: <ChevronsUpDown className={ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
      },
      render: ({ content: Content, columns, columnGap, rows, rowGap }) => {
        return (
          <Content
            style={{
              display: "grid",
              gridTemplateColumns: "1fr ".repeat(columns),
              columnGap,
              gridTemplateRows: "1fr ".repeat(rows),
              rowGap,
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
          labelIcon: <ChevronsRightLeft className={ICON_CLASSNAME} />,
          options: [
            { label: "W prawo", value: "row" },
            { label: "W dół", value: "column" },
          ],
        },
        align: {
          type: "select",
          label: "Wyrównanie na osi głównej",
          labelIcon: <ChevronsRightLeft className={ICON_CLASSNAME} />,
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
          labelIcon: <ChevronsUpDown className={ICON_CLASSNAME} />,
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
          labelIcon: <ChevronsUpDown className={ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
      },
      defaultProps: {
        direction: "row",
        align: "start",
        justify: "start",
        gap: 16,
        content: [],
      },
      render: ({ content: Content, direction, align, justify, gap }) => {
        return (
          <Content
            style={{
              display: "flex",
              flexDirection: direction,
              alignItems: align,
              justifyContent: justify,
              gap,
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
    layout: {
      title: "Układ",
      components: ["Grid", "Flex"],
    },
  },
};

// Describe the initial data
const initialData = {};

// Render Puck editor
export default function Editor() {
  return (
    <Puck
      config={config}
      data={initialData}
      onPublish={(test) => {
        // eslint-disable-next-line no-alert
        alert("See the document data in the console");
        // eslint-disable-next-line no-console
        console.log(test);
      }}
    />
  );
}
