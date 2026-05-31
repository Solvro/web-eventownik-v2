import type {
  AppearanceFields,
  ContainerFields,
  LayoutFields,
} from "@/components/editor/common";
import type { RootSettings } from "@/types/editor";

export const rootDefaults = {
  name: "Nowa wiadomość",
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
];

export const EMAIL_ALLOWED_ATTRIBUTES = {
  "*": ["class", "style"],
  img: ["src", "alt"],
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
