import sanitizeHtml from "sanitize-html";

import { cn } from "@/lib/utils";

function SanitizedContent({
  contentToSanitize,
  className,
}: {
  contentToSanitize: string;
  className?: string;
}) {
  const sanitized = sanitizeHtml(contentToSanitize, {
    allowedAttributes: {
      p: ["style"],
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

  return (
    <div
      className={cn("leading-relaxed whitespace-pre-line", className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export { SanitizedContent };
