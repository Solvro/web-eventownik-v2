import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  FileSpreadsheet,
  Italic,
  SlashSquare,
  Tag,
  Underline,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useEditorActiveState } from "@/hooks/use-editor-active-state";
import type { EditorActiveState } from "@/types/editor-active-state";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ButtonSetProps {
  editor: Editor | null;
  activeState: EditorActiveState;
}

function TypographyButtons({ editor, activeState }: ButtonSetProps) {
  const t = useTranslations("Editor");

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.bold ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className="size-7"
            aria-label={t("bold")}
          >
            <Bold className="size-4!" />
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
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className="size-7"
            aria-label={t("italic")}
          >
            <Italic className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("italic")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.underline ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className="size-7"
            aria-label={t("underline")}
          >
            <Underline className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("underline")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.code ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className="size-7"
            aria-label={t("code")}
          >
            <Code2 className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("code")}</TooltipContent>
      </Tooltip>
    </>
  );
}

function AlignmentDropdown({ editor, activeState }: ButtonSetProps) {
  const t = useTranslations("Editor");

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant={
                activeState.alignCenter ||
                activeState.alignRight ||
                activeState.alignJustify
                  ? "eventDefault"
                  : "eventGhost"
              }
              type="button"
              className="size-7"
            >
              {activeState.alignCenter ? (
                <AlignCenter className="size-4!" />
              ) : null}
              {activeState.alignRight ? (
                <AlignRight className="size-4!" />
              ) : null}
              {activeState.alignJustify ? (
                <AlignJustify className="size-4!" />
              ) : null}
              {!activeState.alignCenter &&
                !activeState.alignRight &&
                !activeState.alignJustify && <AlignLeft className="size-4!" />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            className={activeState.alignLeft ? "bg-accent" : ""}
          >
            <AlignLeft className="mr-2 size-4" />
            <span>{t("alignLeft")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (editor?.isActive({ textAlign: "center" }) ?? false) {
                editor?.chain().focus().setTextAlign("left").run();
              } else {
                editor?.chain().focus().setTextAlign("center").run();
              }
            }}
            className={activeState.alignCenter ? "bg-accent" : ""}
          >
            <AlignCenter className="mr-2 size-4" />
            <span>{t("alignCenter")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (editor?.isActive({ textAlign: "right" }) ?? false) {
                editor?.chain().focus().setTextAlign("left").run();
              } else {
                editor?.chain().focus().setTextAlign("right").run();
              }
            }}
            className={activeState.alignRight ? "bg-accent" : ""}
          >
            <AlignRight className="mr-2 size-4" />
            <span>{t("alignRight")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (editor?.isActive({ textAlign: "justify" }) ?? false) {
                editor?.chain().focus().setTextAlign("left").run();
              } else {
                editor?.chain().focus().setTextAlign("justify").run();
              }
            }}
            className={activeState.alignJustify ? "bg-accent" : ""}
          >
            <AlignJustify className="mr-2 size-4" />
            <span>{t("justify")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent side="bottom">{t("textAlign")}</TooltipContent>
    </Tooltip>
  );
}

function TagButtons({ editor }: ButtonSetProps) {
  const t = useTranslations("Editor");
  const tMessageTags = useTranslations("MessageTags");

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            type="button"
            onClick={() => editor?.chain().focus().insertContent("/").run()}
            variant="eventGhost"
            className="size-7"
            aria-label={t("insertTag")}
          >
            <SlashSquare className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("insertTag")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent(`/${tMessageTags("form").toLowerCase()}`)
                .run()
            }
            variant="eventGhost"
            className="size-7"
            aria-label={t("insertFormLinkTag")}
          >
            <FileSpreadsheet className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("insertFormLinkTag")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent(`/${tMessageTags("attribute").toLowerCase()}`)
                .run()
            }
            variant="eventGhost"
            className="size-7"
            aria-label={t("insertParticipantAttributeTag")}
          >
            <Tag className="size-3.75!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("insertParticipantAttributeTag")}
        </TooltipContent>
      </Tooltip>
    </>
  );
}

function SidebarRichTextMenu({
  children,
  editor,
}: {
  children?: ReactNode;
  editor: Editor | null;
}) {
  const activeState = useEditorActiveState(editor);

  return (
    <div className="bg-background!">
      {children}
      <div className="flex items-center border-b border-(--event-primary-color)/50! py-2 [&>button]:grow">
        <TypographyButtons editor={editor} activeState={activeState} />
      </div>

      <div className="flex items-center border-b border-(--event-primary-color)/50! py-2 [&>button]:grow">
        <AlignmentDropdown editor={editor} activeState={activeState} />
      </div>

      <div className="flex items-center border-b border-(--event-primary-color)/50! py-2 [&>button]:grow">
        <TagButtons editor={editor} activeState={activeState} />
      </div>
    </div>
  );
}

export { SidebarRichTextMenu };
