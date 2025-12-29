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
  readOnly?: boolean; // Made optional for flexibility
  isSelected: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  readOnly = false,
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

  // // Sync external changes (e.g. History undo/redo) back to editor
  // useEffect(() => {
  //   console.log("[Rich Text Sync] useEffect called");
  //   if (editor != null && value !== editor.getHTML()) {
  //     console.log("[Rich Text Sync] PASSED - firing editor setContent");
  //     editor.commands.setContent(value);
  //   }
  // }, [value, editor]);

  // // Handle readOnly changes dynamically
  // useEffect(() => {
  //   if (editor != null) {
  //     editor.setEditable(!readOnly);
  //   }
  // }, [readOnly, editor]);

  useEffect(() => {
    if (editor === null || value === editor.getHTML()) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  return (
    // Add a class for styling overrides if needed
    <div
      className={cn(
        "puck-richtext-wrapper",
        // isSelected ? "cursor-text" : "cursor-grab",
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
