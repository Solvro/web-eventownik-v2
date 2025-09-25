"use client";

import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Extension } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

import { EditorMenuBar } from "./editor-menu-bar";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

function WysiwygEditor({
  content,
  onChange,
  disabled,
  extensions = [],
  className,
}: {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  // TODO: This is for implementing a custom extension for tag hints (as in e.g. '/participant_slug')
  extensions?: Extension<unknown, unknown>[];
  className?: string;
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
    immediatelyRender: false,
    editable: disabled === undefined ? true : !disabled,
    content,
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "pb-4 focus:outline-none cursor-text leading-relaxed",
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
        "border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[60px] max-w-[974px] rounded-xl border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        disabled === undefined || !disabled
          ? ""
          : "pointer-events-none cursor-not-allowed opacity-50",
        className,
      )}
    >
      <EditorMenuBar editor={editor} />
      <ScrollArea className="h-[200px]">
        <EditorContent editor={editor} />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { WysiwygEditor };
