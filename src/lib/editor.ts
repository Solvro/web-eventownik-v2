import type {
  AppearanceFields,
  ContainerFields,
  LayoutFields,
} from "@/components/editor/common";
import type { RootSettings } from "@/types/editor";

export const rootDefaults = {
  name: "",
  trigger: "manual",
  backgroundColor: "#f3f4f6",
} satisfies RootSettings;

export const layoutDefaults = {
  layout: {
    margin: "0",
    padding: "0",
  },
} satisfies LayoutFields;

export const appearanceDefaults = {
  appearance: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
    // NOTE: Commented out until email content storage is implemented by the backend
    // image: {
    //   backgroundImage: "",
    //   backgroundPosition: "center",
    //   backgroundSize: "cover",
    //   backgroundRepeat: "no-repeat",
    // },
    border: {
      borderWidth: "0",
      borderStyle: "solid",
      borderColor: "#000000",
      borderRadius: "0",
    },
  },
} satisfies AppearanceFields;

export const containerDefaults = {
  container: {
    verticalAlign: "middle",
    borderSpacingHorizontal: 0,
    borderSpacingVertical: 0,
  },
} satisfies ContainerFields;

export const EMAIL_ALLOWED_TAGS = [
  "img",
  "a",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "span",
  "div",
  "table",
  "tbody",
  "tr",
  "td",
  "th",
];

export const EMAIL_ALLOWED_ATTRIBUTES = {
  "*": ["class", "style"],
  img: ["src", "alt", "width", "height", "title"],
  a: ["href", "target", "rel"],
  td: ["colspan", "rowspan", "colwidth"],
  th: ["colspan", "rowspan", "colwidth"],
  // Tags
  span: [
    "data-type",
    "data-id",
    "data-label",
    "data-mention-suggestion-char",
    "contenteditable",
  ],
};

export function replaceEmptyParagraphs(content: string) {
  return content.replaceAll(/<p(\s[^>]*)?>(\s*)<\/p>/g, "<p$1><br/></p>");
}
