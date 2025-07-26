"use client";

import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Extensions } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

import { EditorMenuBar } from "./editor-menu-bar";

function WysiwygEditor({
  content,
  onChange,
  disabled,
  extensions = [],
}: {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  extensions?: Extensions;
}) {
  const editor = useEditor({
    immediatelyRender: false,
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
    editable: disabled === undefined ? true : !disabled,
    content,
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "pb-4 focus:outline-none cursor-text h-[200px] overflow-y-auto leading-relaxed",
        role: "textbox",
        "data-testid": "editor",
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Enter") {
          return false;
        }
      },
    },
  });

  useEffect(() => {
    if (editor != null) {
      editor.setEditable(disabled === undefined ? true : !disabled);
    }
  }, [disabled, editor]);

  return (
    <div
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[60px] max-w-[974px] rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        disabled === undefined || !disabled
          ? ""
          : "pointer-events-none cursor-not-allowed opacity-50",
      )}
    >
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export { WysiwygEditor };
