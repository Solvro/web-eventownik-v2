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
  List,
  ListOrdered,
  SlashSquare,
  Tag,
} from "lucide-react";
import { useRef } from "react";

import { getBase64FromUrl } from "@/lib/utils";

import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function EditorMenuBar({
  editor,
  isEmailEditor,
}: {
  editor: Editor | null;
  isEmailEditor?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (editor === null) {
    return <div className="h-8">Ładowanie menu...</div>;
  }

  return (
    <div className="flex gap-4 pb-4">
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={editor.isActive("bold") ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pogrubienie</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={
                editor.isActive("italic") ? "eventDefault" : "eventGhost"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Kursywa</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={editor.isActive("code") ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Kod (czcionka mono)</TooltipContent>
        </Tooltip>
      </div>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <Heading1 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nagłówek stopnia pierwszego</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <Heading2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nagłówek stopnia drugiego</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <Heading3 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nagłówek stopnia trzeciego</TooltipContent>
        </Tooltip>
      </div>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={
                editor.isActive("bulletList") ? "eventDefault" : "eventGhost"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lista punktowa</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={
                editor.isActive("orderedList") ? "eventDefault" : "eventGhost"
              }
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lista numerowana</TooltipContent>
        </Tooltip>
      </div>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              variant={
                editor.isActive({ textAlign: "left" })
                  ? "eventDefault"
                  : "eventGhost"
              }
            >
              <AlignLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wyrównanie do lewej</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <AlignCenter />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wyrównanie do środka</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <AlignRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wyrównanie w prawo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
            >
              <AlignJustify />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Justowanie</TooltipContent>
        </Tooltip>
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant={editor.isActive("image") ? "eventDefault" : "eventGhost"}
          >
            <ImageIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Wstaw zdjęcie</TooltipContent>
      </Tooltip>
      {isEmailEditor === undefined ? null : isEmailEditor ? (
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() => editor.chain().focus().insertContent("/").run()}
                variant={editor.isActive("mention") ? "default" : "ghost"}
              >
                <SlashSquare />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Wstaw znacznik</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() =>
                  editor.chain().focus().insertContent("/formularz").run()
                }
                variant={editor.isActive("mention") ? "default" : "ghost"}
              >
                <FileSpreadsheet />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Wstaw znacznik linku do formularza</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() =>
                  editor.chain().focus().insertContent("/atrybut").run()
                }
                variant={editor.isActive("mention") ? "default" : "ghost"}
              >
                <Tag />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Wstaw znacznik wartości atrybutu uczestnika
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
}

export { EditorMenuBar };
