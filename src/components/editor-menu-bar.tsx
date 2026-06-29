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
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { useEditorActiveState } from "@/hooks/use-editor-active-state";
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
  const t = useTranslations("Editor");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeState = useEditorActiveState(editor);

  if (editor === null) {
    return <div className="h-8">{t("loadingMenu")}</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 pb-4">
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.bold ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("bold")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.italic ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("italic")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.code ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("code")}</TooltipContent>
        </Tooltip>
      </div>

      {isEmailEditor === undefined ? null : isEmailEditor ? (
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                variant={activeState.alignLeft ? "eventDefault" : "eventGhost"}
              >
                <AlignLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("alignLeft")}</TooltipContent>
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
                  activeState.alignCenter ? "eventDefault" : "eventGhost"
                }
              >
                <AlignCenter />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("alignCenter")}</TooltipContent>
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
                variant={activeState.alignRight ? "eventDefault" : "eventGhost"}
              >
                <AlignRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("alignRight")}</TooltipContent>
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
                  activeState.alignJustify ? "eventDefault" : "eventGhost"
                }
              >
                <AlignJustify />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("justify")}</TooltipContent>
          </Tooltip>
        </div>
      ) : null}

      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.bulletList ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("bulletList")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.orderedList ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("numberedList")}</TooltipContent>
        </Tooltip>
      </div>

      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.heading1 ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("heading1")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.heading2 ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("heading2")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeState.heading3 ? "eventDefault" : "eventGhost"}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("heading3")}</TooltipContent>
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
            variant="eventGhost"
          >
            <ImageIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("insertImage")}</TooltipContent>
      </Tooltip>
      {isEmailEditor === undefined ? null : isEmailEditor ? (
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() => editor.chain().focus().insertContent("/").run()}
                variant="ghost"
              >
                <SlashSquare />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("insertTag")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() =>
                  editor.chain().focus().insertContent("/formularz").run()
                }
                variant="ghost"
              >
                <FileSpreadsheet />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("insertFormLinkTag")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                type="button"
                onClick={() =>
                  editor.chain().focus().insertContent("/atrybut").run()
                }
                variant="ghost"
              >
                <Tag />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("insertParticipantAttributeTag")}
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
}

export { EditorMenuBar };
