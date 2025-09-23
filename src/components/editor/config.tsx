import type { Config, Content } from "@measured/puck";
import {
  ALargeSmall,
  ChevronsRightLeft,
  ChevronsUpDown,
  Columns3,
  DotSquare,
  ImageUpscale,
  LinkIcon,
  Mail,
  Rows3,
  Tag,
  Type,
} from "lucide-react";
import type { CSSProperties } from "react";

import { EMAIL_TAGS } from "@/lib/emails";

import type {
  AppearanceFields,
  LayoutFields,
  TypographyFields,
} from "./common";
import {
  PUCK_ICON_CLASSNAME,
  withAppearance,
  withLayout,
  withTypography,
} from "./common";

// Definiuje pola dla tego komponentu i ich typy
interface HeadingFields extends TypographyFields {
  title: string;
  level: number;
}

interface ParagraphFields extends TypographyFields {
  content: string;
}

interface GridFields extends LayoutFields, AppearanceFields {
  content: Content;
  columns: number;
  columnGap: number;
  rows: number;
  rowGap: number;
}

interface FlexFields extends LayoutFields, AppearanceFields {
  content: Content;
  direction: "row" | "column";
  align: "start" | "center" | "end" | "stretch";
  justify: "start" | "center" | "end" | "stretch";
  gap: number;
}

interface ImageFields extends LayoutFields {
  src: string;
  alt: string;
  objectFit: CSSProperties["objectFit"];
}

interface UnorderedListFields extends TypographyFields {
  items: Record<"content", string>[];
  listStyleType: string;
}

export interface TagFields extends TypographyFields {
  type: (typeof EMAIL_TAGS)[number]["value"];
}

interface Components {
  Heading: HeadingFields;
  Paragraph: ParagraphFields;
  Tag: TagFields;
  UnorderedList: UnorderedListFields;
  Grid: GridFields;
  Flex: FlexFields;
  Divider: {
    height: string;
  } & AppearanceFields;
  Image: ImageFields;
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

export const puckConfig: Config<Components> = {
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
          color: "inherit",
        },
      },
      render: ({ level, title, typography }) => {
        return (
          <div
            style={{
              textAlign: typography.textAlign,
              fontWeight: typography.fontWeight,
              fontSize: typography.fontSize,
              color: typography.color,
            }}
            className="p-4 text-inherit"
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
          color: "inherit",
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
            className="p-4 text-inherit"
          >
            {/* NOTE: We render the paragraph with additional padding, so that the "bubble" is not cut off.
                This is not reflected in the document schema, though it creates a visual mismatch
                between what you see in the editor and what gets sent to the user
            */}
            <p className="text-inherit">{content}</p>
          </div>
        );
      },
    },
    Tag: {
      label: "Znacznik",
      fields: {
        type: {
          type: "select",
          label: "Rodzaj znacznika",
          labelIcon: <Tag className={PUCK_ICON_CLASSNAME} />,
          options: EMAIL_TAGS.map((tag) => {
            return {
              label: tag.title,
              value: tag.value,
            };
          }),
        },
        ...withTypography,
      },
      defaultProps: {
        type: EMAIL_TAGS[0].value,
        typography: {
          fontWeight: "400",
          textAlign: "left",
          fontSize: 16,
          color: "inherit",
        },
      },
      render({
        puck,
        type,
        typography: { fontWeight, textAlign, fontSize, color },
      }) {
        const tagLabel =
          EMAIL_TAGS.find((tag) => tag.value === type)?.title ??
          "Nieznany znacznik";

        if (puck.metadata.isPreview as boolean) {
          const tagMap = new Map<
            (typeof EMAIL_TAGS)[number]["value"],
            string
          >();
          tagMap.set(EMAIL_TAGS[0].value, "Wydarzenie XYZ");
          tagMap.set(EMAIL_TAGS[1].value, "14 listopada 2025");
          tagMap.set(EMAIL_TAGS[2].value, "16 listopada 2025");
          tagMap.set(EMAIL_TAGS[3].value, "wydarzenie_xyz");
          tagMap.set(EMAIL_TAGS[4].value, "#ff0000");
          tagMap.set(EMAIL_TAGS[5].value, "uczestnik@gmail.com");
          tagMap.set(EMAIL_TAGS[6].value, "13");
          tagMap.set(EMAIL_TAGS[7].value, "djUmEdS34asxZ");
          tagMap.set(EMAIL_TAGS[8].value, "10 listopada 2025");

          return (
            <p
              style={{
                fontWeight,
                textAlign,
                fontSize,
                color,
              }}
            >
              {tagMap.get(type)}
            </p>
          );
        } else {
          return (
            <div
              style={{
                fontSize,
                fontWeight,
                textAlign,
                color,
                backgroundColor: `${color}30`,
              }}
              className="flex items-center gap-2 rounded-lg p-4 text-inherit"
              data-tag={type}
            >
              <Tag className="size-4" />
              {tagLabel}
            </div>
          );
        }
      },
    },
    UnorderedList: {
      label: "Lista nieuporządkowana",
      fields: {
        items: {
          type: "array",
          label: "Elementy listy",
          arrayFields: {
            content: { label: "Treść punktu", type: "textarea" },
          },
          getItemSummary: (_, index) =>
            `Element #${((index ?? 0) + 1).toString()}`,
        },
        listStyleType: {
          type: "select",
          label: "Rodzaj punktorów",
          labelIcon: <DotSquare className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "Kółko", value: "disc" },
            { label: "Okrąg", value: "circle" },
            { label: "Kwadrat", value: "square" },
            { label: "Cyfry", value: "decimal" },
            { label: "Małe litery", value: "lower-alpha" },
            { label: "Wielkie litery", value: "upper-alpha" },
          ],
        },
        ...withTypography,
      },
      render({
        items,
        listStyleType,
        typography: { fontWeight, textAlign, fontSize, color },
      }) {
        return (
          <ul
            style={{
              listStyleType,
              fontWeight,
              textAlign,
              fontSize,
              color,
              marginLeft: 18,
            }}
          >
            {items.map(({ content }) => (
              <li key={content}>{content}</li>
            ))}
          </ul>
        );
      },
      defaultProps: {
        typography: {
          fontWeight: "400",
          textAlign: "left",
          fontSize: 16,
          color: "inherit",
        },
        items: [],
        listStyleType: "disc",
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
          label: "Odstęp kolumn",
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
          label: "Odstęp rzędów",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        ...withLayout,
        ...withAppearance,
      },
      render: ({
        content: Content,
        columns,
        columnGap,
        rows,
        rowGap,
        layout: { width, height, margin, padding },
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
      }) => {
        return (
          <Content
            style={{
              display: "grid",
              gridTemplateColumns: "1fr ".repeat(columns),
              columnGap,
              gridTemplateRows: "1fr ".repeat(rows),
              rowGap,
              color,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundPosition,
              backgroundSize,
              backgroundRepeat,
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
        ...withAppearance,
      },
      defaultProps: {
        direction: "row",
        align: "start",
        justify: "start",
        gap: 16,
        content: [],
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
      render: ({
        content: Content,
        direction,
        align,
        justify,
        gap,
        layout: { width, height, margin, padding },
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
      }) => {
        return (
          <Content
            style={{
              display: "flex",
              flexDirection: direction,
              alignItems: align,
              justifyContent: justify,
              gap,
              color,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundPosition,
              backgroundSize,
              backgroundRepeat,
              width: `${width}px`,
              height: `${height}px`,
              margin: `${margin}px`,
              padding: `${padding}px`,
            }}
          />
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
          <div
            style={{
              height: `${height}px`,
              backgroundColor,
              color,
            }}
          />
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src === "" ? `/editor-image-placeholder.png` : src}
            alt={alt}
            style={{
              objectFit,
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
      components: ["Heading", "Paragraph", "Tag", "UnorderedList"],
    },
    layout: {
      title: "Układ",
      components: ["Grid", "Flex", "Divider"],
    },
    media: {
      title: "Media",
      components: ["Image"],
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
