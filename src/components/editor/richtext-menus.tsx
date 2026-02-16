import { RichTextMenu } from "@puckeditor/core";
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
          >
            <Bold className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Pogrubienie</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.italic ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className="size-7"
          >
            <Italic className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Kursywa</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.underline ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className="size-7"
          >
            <Underline className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Podkreślenie</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={activeState.code ? "eventDefault" : "eventGhost"}
            type="button"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className="size-7"
          >
            <Code2 className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Kod (czcionka mono)</TooltipContent>
      </Tooltip>
    </>
  );
}

function AlignmentDropdown({ editor, activeState }: ButtonSetProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* NOTE: Tooltip fix - the DropdownMenu must contain the Trigger, but the Trigger is what the Tooltip attaches to */}
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
                  !activeState.alignJustify && (
                    <AlignLeft className="size-4!" />
                  )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              className={activeState.alignLeft ? "bg-accent" : ""}
            >
              <AlignLeft className="mr-2 size-4" />
              <span>Wyrównanie do lewej</span>
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
              <span>Wyrównanie do środka</span>
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
              <span>Wyrównanie w prawo</span>
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
              <span>Justowanie</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>Wyrównanie tekstu</TooltipContent>
    </Tooltip>
  );
}

function TagButtons({ editor }: ButtonSetProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            type="button"
            onClick={() => editor?.chain().focus().insertContent("/").run()}
            variant="ghost"
            className="size-7"
          >
            <SlashSquare className="size-4!" />
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
              editor?.chain().focus().insertContent("/formularz").run()
            }
            variant="ghost"
            className="size-7"
          >
            <FileSpreadsheet className="size-4!" />
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
              editor?.chain().focus().insertContent("/atrybut").run()
            }
            variant="ghost"
            className="size-7"
          >
            <Tag className="size-3.75!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Wstaw znacznik wartości atrybutu uczestnika
        </TooltipContent>
      </Tooltip>
    </>
  );
}

function InlineRichTextMenu({
  children,
  editor,
}: {
  children?: ReactNode;
  editor: Editor | null;
}) {
  const activeState = useEditorActiveState(editor);

  return (
    <RichTextMenu>
      {children}
      <RichTextMenu.Group>
        <TypographyButtons editor={editor} activeState={activeState} />
      </RichTextMenu.Group>

      <RichTextMenu.Group>
        <AlignmentDropdown editor={editor} activeState={activeState} />
      </RichTextMenu.Group>

      <RichTextMenu.Group>
        <TagButtons editor={editor} activeState={activeState} />
      </RichTextMenu.Group>
    </RichTextMenu>
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
    <>
      {children}
      <div className="flex items-center py-2 [&>button]:grow">
        <TypographyButtons editor={editor} activeState={activeState} />
      </div>

      <div className="flex items-center py-2 [&>button]:grow">
        <AlignmentDropdown editor={editor} activeState={activeState} />
      </div>

      <div className="flex items-center py-2 [&>button]:grow">
        <TagButtons editor={editor} activeState={activeState} />
      </div>
    </>
  );
}

export { InlineRichTextMenu, SidebarRichTextMenu };
