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
  Type,
} from "lucide-react";
import type { CSSProperties } from "react";

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

interface Components {
  Heading: HeadingFields;
  Paragraph: ParagraphFields;
  UnorderedList: UnorderedListFields;
  Grid: GridFields;
  Flex: FlexFields;
  Divider: {
    height: string;
  } & AppearanceFields;
  Image: ImageFields;
}

function HeadingComponent({ title, level }: { title: string; level: number }) {
  const style = { margin: 0 };
  switch (level) {
    case 1: {
      return <h1 style={style}>{title}</h1>;
    }
    case 2: {
      return <h2 style={style}>{title}</h2>;
    }
    case 3: {
      return <h3 style={style}>{title}</h3>;
    }
    default: {
      return <h1 style={style}>{title}</h1>;
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
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
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
          <table width="100%" {...tableProps} style={tableStyle}>
            <tbody>
              <tr>
                <td
                  style={{
                    textAlign: typography.textAlign,
                    fontWeight: typography.fontWeight,
                    fontSize: typography.fontSize,
                    color: typography.color,
                    padding: "16px",
                    fontFamily: "sans-serif",
                  }}
                >
                  <HeadingComponent level={level} title={title} />
                </td>
              </tr>
            </tbody>
          </table>
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
          <table width="100%" {...tableProps} style={tableStyle}>
            <tbody>
              <tr>
                <td
                  style={{
                    textAlign: typography.textAlign,
                    fontWeight: typography.fontWeight,
                    fontSize: typography.fontSize,
                    color: typography.color,
                    padding: "16px",
                    fontFamily: "sans-serif",
                  }}
                >
                  <p style={{ margin: 0, lineHeight: "1.5" }}>{content}</p>
                </td>
              </tr>
            </tbody>
          </table>
        );
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
          <table width="100%" {...tableProps} style={tableStyle}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "16px",
                    color,
                    fontSize,
                    fontWeight,
                    fontFamily: "sans-serif",
                  }}
                >
                  <ul
                    style={{
                      listStyleType,
                      margin: 0,
                      paddingLeft: "20px",
                      textAlign,
                    }}
                  >
                    {items.map(({ content }) => (
                      <li key={content} style={{ marginBottom: "4px" }}>
                        {content}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
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
      label: "Kontener (Grid)",
      fields: {
        content: {
          type: "slot",
          label: "Bloki w kontenerze",
        },
        columns: {
          type: "number",
          label: "Kolumny (nieobsługiwane w emailu)",
          labelIcon: <Columns3 className={PUCK_ICON_CLASSNAME} />,
          min: 1,
          max: 6,
        },
        columnGap: {
          type: "number",
          label: "Odstęp",
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
        layout: { width, margin, padding },
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
          <table
            width={width === "auto" ? "100%" : width}
            {...tableProps}
            style={{
              ...tableStyle,
              margin: `${margin}px auto`,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundPosition,
              backgroundSize,
              backgroundRepeat,
              color,
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: `${padding}px` }}>
                  <Content />
                </td>
              </tr>
            </tbody>
          </table>
        );
      },
      defaultProps: {
        columns: 1,
        columnGap: 0,
        rows: 1,
        rowGap: 0,
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
      label: "Kontener (Flex)",
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
          label: "Wyrównanie",
          labelIcon: <ChevronsRightLeft className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "Do lewej", value: "start" },
            { label: "Do środka", value: "center" },
            { label: "Do prawej", value: "end" },
          ],
        },
        justify: {
          type: "select",
          label: "Justowanie",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          options: [
            { label: "Do góry", value: "start" },
            { label: "Do środka", value: "center" },
            { label: "Do dołu", value: "end" },
          ],
        },
        gap: {
          type: "number",
          label: "Odstęp",
          labelIcon: <ChevronsUpDown className={PUCK_ICON_CLASSNAME} />,
          min: 0,
          max: 100,
        },
        ...withLayout,
        ...withAppearance,
      },
      defaultProps: {
        direction: "column",
        align: "start",
        justify: "start",
        gap: 0,
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
        layout: { width, margin, padding },
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
          <table
            width={width === "auto" ? "100%" : width}
            {...tableProps}
            style={{
              ...tableStyle,
              margin: `${margin}px auto`,
              backgroundColor,
              backgroundImage: `url('${backgroundImage}')`,
              backgroundPosition,
              backgroundSize,
              backgroundRepeat,
              color,
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: `${padding}px` }}>
                  <Content />
                </td>
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
  },
  categories: {
    typography: {
      title: "Tekst",
      components: ["Heading", "Paragraph", "UnorderedList"],
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
