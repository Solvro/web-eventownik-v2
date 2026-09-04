import { Extension, generateJSON } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

/**
 * PasteHtml
 *
 * Mirrors the PasteMarkdown pattern, but for HTML source pasted as plain text
 * (e.g. copied from a code editor, a "view source" panel, or typed directly),
 * rather than copied from a rendered web page.
 *
 * Note this is a different problem than "pasting rich content from a website".
 * When you copy from an actual web page, the browser puts real markup on the
 * clipboard under the `text/html` MIME type, and Tiptap/ProseMirror already
 * parses that automatically — no custom code needed for that path. This
 * extension only kicks in when the clipboard has *no* `text/html` payload,
 * just plain text that happens to look like HTML source.
 */
const PasteHtml = Extension.create({
  name: "pasteHtml",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        props: {
          handlePaste(_, event) {
            const html = event.clipboardData?.getData("text/html");

            // Real HTML is already on the clipboard — let Tiptap's default
            // paste handling parse it. Don't double-handle it here.
            if (html !== undefined) {
              return false;
            }

            const text = event.clipboardData?.getData("text/plain");

            if (text === undefined || !looksLikeHtml(text)) {
              return false;
            }

            // Parse the HTML string into Tiptap/ProseMirror JSON using the
            // editor's own extensions, so the result respects the same
            // schema (nodes/marks) the editor is configured with.
            const json = generateJSON(text, editor.extensionManager.extensions);

            editor.commands.insertContent(json);
            return true;
          },
        },
      }),
    ];
  },
});

function looksLikeHtml(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed.startsWith("<")) {
    return false;
  }

  return (
    /^<!doctype html/i.test(trimmed) || // full document
    /<\/[a-z][\w-]*>/i.test(trimmed) || // has a closing tag, e.g. </p>
    /<[a-z][\w-]*[^>]*\/>/i.test(trimmed) // self-closing tag, e.g. <br/>
  );
}

export { PasteHtml };
