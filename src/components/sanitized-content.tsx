import sanitizeHtml from "sanitize-html";

function SanitizedContent({
  contentToSanitize,
}: {
  contentToSanitize: string;
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
    ],
    allowedSchemes: ["data", "https"],
  });

  return (
    <div
      className="leading-relaxed whitespace-pre-line [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export { SanitizedContent };
