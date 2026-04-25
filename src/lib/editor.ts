import type { ComponentDataMap } from "@puckeditor/core";
import sanitizeHtml from "sanitize-html";

import type {
  AppearanceFields,
  ContainerFields,
  LayoutFields,
} from "@/components/editor/common";
import type { PuckComponents, PuckData, RootSettings } from "@/types/editor";
import type { SingleEventEmail } from "@/types/emails";

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
    image: {
      backgroundImage: "",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    },
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

const EMAIL_ALLOWED_TAGS = [
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

const EMAIL_ALLOWED_ATTRIBUTES = {
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

function extractAndCleanImages(html: string): {
  cleanedHtml: string;
  images: { src: string; alt: string }[];
} {
  const images: { src: string; alt: string }[] = [];

  const cleanedHtml = sanitizeHtml(html, {
    allowedTags: EMAIL_ALLOWED_TAGS,
    allowedAttributes: EMAIL_ALLOWED_ATTRIBUTES,
    allowedSchemes: ["data", "https"],
    transformTags: {
      img: (_, attribs) => {
        images.push({
          src: attribs.src,
          alt: attribs.alt,
        });
        return { tagName: "img", attribs }; // still returned, then stripped by allowedTags
      },
    },
  });

  return { cleanedHtml, images };
}

export function getPuckSchemaFromLegacyEmail(
  email: SingleEventEmail,
): PuckData {
  const { cleanedHtml, images } = extractAndCleanImages(email.content);

  const imageComponents: ComponentDataMap<PuckComponents>[] = images.map(
    (image, index) => ({
      type: "Image",
      props: {
        id: `Image-${(index + 1).toString()}`,
        width: "128",
        height: "128",
        src: image.src,
        alt: image.alt,
        href: "",
        objectFit: "contain",
        ...layoutDefaults,
      },
    }),
  );

  return {
    content: [
      {
        type: "RichText",
        props: {
          id: "RichText-1",
          content: cleanedHtml,
          ...appearanceDefaults,
        },
      },
      ...imageComponents,
    ],
    root: {
      props: {
        name: email.name,
        trigger: email.trigger,
        backgroundColor: rootDefaults.backgroundColor,
        triggerValue: email.triggerValue ?? null,
        triggerValue2: email.triggerValue2 ?? null,
      },
    },
    zones: {},
  };
}

export function replaceEmptyParagraphs(content: string) {
  return content.replaceAll(/<p(\s[^>]*)?>(\s*)<\/p>/g, "<p$1><br/></p>");
}
