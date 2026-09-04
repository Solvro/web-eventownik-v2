import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

// `doc`/`text` have no HTML tag of their own to carry a style attribute on,
// and `textStyle` (from `@tiptap/extension-text-style`) already defines its
// own `style` attribute for bare `<span style="...">` runs.
const STYLE_ATTRIBUTE_DENYLIST = new Set(["doc", "text", "textStyle"]);

/**
 * PreserveInlineStyles
 *
 * Pasted HTML from real-world sources (e.g. email signatures exported from
 * Gmail) leans heavily on inline `style` attributes for layout and
 * typography, on elements that have no corresponding node/mark in this
 * editor's schema. Two problems combine to lose that styling on paste:
 *
 * 1. ProseMirror's schema has no generic "style" attribute on most
 *    node/mark types, so even where an element *does* map to a node
 *    (paragraph, tableCell, image, link, ...), its `style` attribute is
 *    silently dropped during parsing.
 * 2. Layout `<div>`s (e.g. a `text-align: center` wrapper around a row of
 *    icons, or a `height: 10px` spacer between paragraphs) have no matching
 *    node at all. ProseMirror treats unmatched tags as transparent: it
 *    keeps the children but drops the wrapper, so the div's own style
 *    (its only reason for existing) disappears along with it.
 *
 * This extension addresses both: a global `style` attribute is added to
 * every node/mark type in the schema (except the ones where it's
 * meaningless or already handled - see the denylist), and a
 * `transformPastedHTML` hook rewrites any `div[style]` into a `<p style="...">`
 * before parsing, so the style has a real node to land on instead of being
 * parsed away with its wrapper.
 */
const PreserveInlineStyles = Extension.create({
  name: "preserveInlineStyles",

  addGlobalAttributes() {
    const types = this.extensions
      .map((extension) => extension.name)
      .filter((name) => !STYLE_ATTRIBUTE_DENYLIST.has(name));

    return [
      {
        types,
        attributes: {
          style: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("style"),
            renderHTML: (attributes: { style?: string | null }) =>
              attributes.style != null && attributes.style !== ""
                ? { style: attributes.style }
                : {},
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedHTML(html) {
            const container = document.createElement("div");
            container.innerHTML = html;

            for (const div of container.querySelectorAll("div[style]")) {
              const p = document.createElement("p");
              // `div[style]` guarantees the attribute is present here.
              const style = div.getAttribute("style") ?? "";
              // We turn a `div` into `p`. Paragraphs tend to have default margins in email clients,
              // unlike divs. If something was a div before the transformation, it shouldn't have
              // any margin, so we reset it to 0 before applying the other styles
              p.setAttribute("style", `margin: 0; ${style}`);
              // Move the real child nodes (rather than copying innerHTML as
              // a string) so any div[style] nested inside this one is still
              // reachable by the same querySelectorAll pass.
              while (div.firstChild !== null) {
                p.append(div.firstChild);
              }
              div.replaceWith(p);
            }

            return container.innerHTML;
          },
        },
      }),
    ];
  },
});

export { PreserveInlineStyles };
