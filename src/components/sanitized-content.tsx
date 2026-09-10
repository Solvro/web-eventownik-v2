import { getLocale } from "next-intl/server";
import sanitizeHtml from "sanitize-html";

import { cn, legacyTranslate } from "@/lib/utils";

async function SanitizedContent({
  contentToSanitize,
  className,
}: {
  contentToSanitize: string;
  className?: string;
}) {
  const locale = await getLocale();

  const sanitized = sanitizeHtml(contentToSanitize, {
    allowedAttributes: {
      a: ["href", "name", "target"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    },
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "br",
      "pre",
      "strong",
      "em",
      "a",
      "img",
      "ol",
      "ul",
      "li",
    ],
    allowedSchemes: ["data", "https"],
  });

  // TODO: Refactor this once we get proper user-provided values translations
  // An event description is always contained within a paragraph, `.slice(3, -4)` removes its tags
  const translated = legacyTranslate(sanitized.slice(3, -4), locale);

  return (
    <div
      className={cn("leading-relaxed whitespace-pre-line", className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: translated }}
    />
  );
}

export { SanitizedContent };
