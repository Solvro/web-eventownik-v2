"use client";

import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";

import { setupSuggestions } from "@/lib/extensions/tags";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  isSelected: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  readOnly = false,
  isSelected,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Zacznij pisać...",
        showOnlyWhenEditable: false,
      }),
      ...setupSuggestions([]),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor: onUpdateEditor }) => {
      onChange(onUpdateEditor.getHTML());
    },
  });

  useEffect(() => {
    if (editor != null) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  useEffect(() => {
    if (editor === null || value === editor.getHTML()) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  return (
    <div
      className={cn(
        "puck-richtext-wrapper",
        isSelected ? "cursor-text" : "cursor-grab",
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
