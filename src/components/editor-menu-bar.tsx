"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  FileSpreadsheet,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  SlashSquare,
  Tag,
} from "lucide-react";
import { useRef } from "react";

import { getBase64FromUrl } from "@/lib/utils";

import { Button } from "./ui/button";

function EditorMenuBar({
  editor,
  showTagControls,
}: {
  editor: Editor | null;
  showTagControls?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (editor === null) {
    return <div className="h-8">Ładowanie menu...</div>;
  }

  return (
    <div className="flex gap-4 pb-4">
      <div>
        <Button
          size="icon"
          variant={editor.isActive("bold") ? "eventDefault" : "eventGhost"}
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Pogrubienie"
        >
          <Bold />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("italic") ? "eventDefault" : "eventGhost"}
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Kursywa"
        >
          <Italic />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("code") ? "eventDefault" : "eventGhost"}
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Kod (czcionka mono)"
        >
          <Code2 />
        </Button>
      </div>
      <div>
        <Button
          size="icon"
          variant={
            editor.isActive("heading", { level: 1 })
              ? "eventDefault"
              : "eventGhost"
          }
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Nagłówek stopnia pierwszego"
        >
          <Heading1 />
        </Button>
        <Button
          size="icon"
          variant={
            editor.isActive("heading", { level: 2 })
              ? "eventDefault"
              : "eventGhost"
          }
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Nagłówek stopnia drugiego"
        >
          <Heading2 />
        </Button>
        <Button
          size="icon"
          variant={
            editor.isActive("heading", { level: 3 })
              ? "eventDefault"
              : "eventGhost"
          }
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Nagłówek stopnia trzeciego"
        >
          <Heading3 />
        </Button>
      </div>
      <div>
        <Button
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          variant={
            editor.isActive({ textAlign: "left" })
              ? "eventDefault"
              : "eventGhost"
          }
          title="Wyrównanie do lewej"
        >
          <AlignLeft />
        </Button>
        <Button
          size="icon"
          type="button"
          onClick={() => {
            if (editor.isActive({ textAlign: "center" })) {
              editor.chain().focus().setTextAlign("left").run();
            } else {
              editor.chain().focus().setTextAlign("center").run();
            }
          }}
          variant={
            editor.isActive({ textAlign: "center" })
              ? "eventDefault"
              : "eventGhost"
          }
          title="Wyrównanie do środka"
        >
          <AlignCenter />
        </Button>
        <Button
          size="icon"
          type="button"
          onClick={() => {
            if (editor.isActive({ textAlign: "right" })) {
              editor.chain().focus().setTextAlign("left").run();
            } else {
              editor.chain().focus().setTextAlign("right").run();
            }
          }}
          variant={
            editor.isActive({ textAlign: "right" })
              ? "eventDefault"
              : "eventGhost"
          }
          title="Wyrównanie w prawo"
        >
          <AlignRight />
        </Button>
        <Button
          size="icon"
          type="button"
          onClick={() => {
            if (editor.isActive({ textAlign: "justify" })) {
              editor.chain().focus().setTextAlign("left").run();
            } else {
              editor.chain().focus().setTextAlign("justify").run();
            }
          }}
          variant={
            editor.isActive({ textAlign: "justify" })
              ? "eventDefault"
              : "eventGhost"
          }
          title="Justowanie"
        >
          <AlignJustify />
        </Button>
      </div>
      <input
        type="file"
        className="sr-only"
        ref={fileInputRef}
        onChangeCapture={async (event) => {
          const input = event.target as HTMLInputElement;
          if (input.files?.[0] != null) {
            const newBlobUrl = URL.createObjectURL(input.files[0]);
            const base64 = await getBase64FromUrl(newBlobUrl);
            editor.chain().focus().setImage({ src: base64 }).run();
            URL.revokeObjectURL(newBlobUrl);
          }
        }}
      />
      <Button
        size="icon"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        variant={editor.isActive("image") ? "eventDefault" : "eventGhost"}
        title="Wstaw zdjęcie"
      >
        <ImageIcon />
      </Button>
      {showTagControls === undefined ? null : showTagControls ? (
        <div>
          <Button
            size="icon"
            type="button"
            onClick={() => editor.chain().focus().insertContent("/").run()}
            variant={editor.isActive("mention") ? "default" : "ghost"}
            title="Wstaw znacznik"
          >
            <SlashSquare />
          </Button>
          <Button
            size="icon"
            type="button"
            onClick={() =>
              editor.chain().focus().insertContent("/formularz").run()
            }
            variant={editor.isActive("mention") ? "default" : "ghost"}
            title="Wstaw znacznik linku do formularza"
          >
            <FileSpreadsheet />
          </Button>
          <Button
            size="icon"
            type="button"
            onClick={() =>
              editor.chain().focus().insertContent("/atrybut").run()
            }
            variant={editor.isActive("mention") ? "default" : "ghost"}
            title="Wstaw znacznik wartości atrybutu uczestnika"
          >
            <Tag />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { EditorMenuBar };
