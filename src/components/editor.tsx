"use client";

import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Extension } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { EditorMenuBar } from "./editor-menu-bar";

function WysiwygEditor({
  content,
  onChange,
  extensions = [],
}: {
  content: string;
  onChange: (value: string) => void;
  // TODO: This is for implementing a custom extension for tag hints (as in e.g. '/participant_slug')
  extensions?: Extension<unknown, unknown>[];
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Napisz wiadomość" }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Image.configure({
        allowBase64: true,
      }),
      ...extensions,
    ],
    content,
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "pb-4 focus:outline-none cursor-text max-h-[200px] overflow-y-auto leading-relaxed",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter") {
          return false;
        }
      },
    },
  });

  return (
    <div className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[60px] max-w-[974px] rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export { WysiwygEditor };
