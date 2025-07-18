"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  SlashSquare,
} from "lucide-react";
import { useRef } from "react";

import { getBase64FromUrl } from "@/lib/utils";

import { Button } from "./ui/button";

function EditorMenuBar({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (editor === null) {
    return <div className="h-8">Ładowanie menu...</div>;
  }

  return (
    <div className="flex gap-2 pb-4">
      <Button
        size="icon"
        variant={editor.isActive("bold") ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Pogrubienie"
      >
        <Bold />
      </Button>
      <Button
        size="icon"
        variant={editor.isActive("italic") ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Kursywa"
      >
        <Italic />
      </Button>
      <Button
        size="icon"
        variant={editor.isActive("code") ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Kod (czcionka mono)"
      >
        <Code2 />
      </Button>
      <Button
        size="icon"
        variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Nagłówek stopnia pierwszego"
      >
        <Heading1 />
      </Button>
      <Button
        size="icon"
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Nagłówek stopnia drugiego"
      >
        <Heading2 />
      </Button>
      <Button
        size="icon"
        variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Nagłówek stopnia trzeciego"
      >
        <Heading3 />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
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
        variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
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
        variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
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
          editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
        }
        title="Justowanie"
      >
        <AlignJustify />
      </Button>
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
        variant={editor.isActive("image") ? "default" : "ghost"}
        title="Wstaw zdjęcie"
      >
        <ImageIcon />
      </Button>
      <Button
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().insertContent("/").run()}
        variant={editor.isActive("mention") ? "default" : "ghost"}
        title="Wstaw znacznik"
      >
        <SlashSquare />
      </Button>
    </div>
  );
}

export { EditorMenuBar };
