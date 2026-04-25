import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

import type { EditorActiveState } from "@/types/editor-active-state";

export function useEditorActiveState(editor: Editor | null) {
  const [activeState, setActiveState] = useState<EditorActiveState>({
    bold: false,
    italic: false,
    underline: false,
    code: false,
    heading1: false,
    heading2: false,
    heading3: false,
    bulletList: false,
    orderedList: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  useEffect(() => {
    if (editor === null) {
      return;
    }

    const updateState = () => {
      setActiveState({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        code: editor.isActive("code"),
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        alignLeft: editor.isActive({ textAlign: "left" }),
        alignCenter: editor.isActive({ textAlign: "center" }),
        alignRight: editor.isActive({ textAlign: "right" }),
        alignJustify: editor.isActive({ textAlign: "justify" }),
      });
    };

    editor.on("transaction", updateState);
    updateState();

    return () => {
      editor.off("transaction", updateState);
    };
  }, [editor]);

  return activeState;
}
