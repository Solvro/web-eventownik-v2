"use client";

import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Extensions } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";

import { PreserveInlineStyles } from "@/lib/preserve-inline-styles";
import { cn } from "@/lib/utils";

import { EditorMenuBar } from "./editor-menu-bar";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

function WysiwygEditor({
  content,
  onChange,
  disabled,
  extensions = [],
  className,
  editorClassName,
  isEmailEditor = false,
  placeholder = "Napisz wiadomość",
}: {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  extensions?: Extensions;
  className?: string;
  editorClassName?: string;
  /**
   * If true, enables tag-related buttons in menu and default CSS styling for editor content.
   */
  isEmailEditor?: boolean;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      TextStyle,
      PreserveInlineStyles,
      ...extensions,
    ],
    editable: disabled === undefined ? true : !disabled,
    content,
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "pb-4 focus:outline-none cursor-text leading-relaxed",
          editorClassName,
        ),
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

  // update the editor content when the content prop changes
  // this is needed to reset the editor content when form.reset() is called
  useEffect(() => {
    if (editor != null && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-15 max-w-243.5 resize-y flex-col overflow-hidden rounded-xl border bg-transparent text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        disabled === undefined || !disabled
          ? ""
          : "pointer-events-none cursor-not-allowed opacity-50",
        className,
      )}
    >
      <EditorMenuBar editor={editor} isEmailEditor={isEmailEditor} />
      <ScrollArea className="min-h-0 flex-1">
        <EditorContent
          editor={editor}
          className={isEmailEditor ? "email-root bg-white p-2 text-black" : ""}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { WysiwygEditor };
