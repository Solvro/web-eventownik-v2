"use client";

import { computePosition, flip, shift } from "@floating-ui/dom";
import { Mention } from "@tiptap/extension-mention";
import { Plugin } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import { ReactRenderer, mergeAttributes } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import type { useTranslations } from "next-intl";

import { TagsList } from "@/components/tags-list";

import { RESOURCE_TAG_REGEX, getMessageTags, getTagStyle } from ".";
import type { MessageTag } from ".";

/**
 * NOTE: This function assumes that the TipTap editor with Tags extensions mounted is located in a Puck editor instance
 * but it works fine outside it as well
 */
const updatePosition = async (
  editor: Editor,
  element: HTMLElement,
  getClientRect: (() => DOMRect | null) | null | undefined,
) => {
  const virtualElement = {
    getBoundingClientRect: () => {
      let rect = getClientRect?.();

      const isInvalidRect =
        rect === null ||
        rect === undefined ||
        (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0);

      if (isInvalidRect) {
        const { from } = editor.state.selection;
        const cursorRect = editor.view.coordsAtPos(from);
        rect = new DOMRect(cursorRect.left, cursorRect.top, 0, 0);
      }

      const iframeWindow = editor.view.dom.ownerDocument.defaultView;

      if (
        iframeWindow?.frameElement != null &&
        rect !== null &&
        rect !== undefined
      ) {
        const iframeRect = iframeWindow.frameElement.getBoundingClientRect();

        rect = new DOMRect(
          rect.left + iframeRect.left,
          rect.top + iframeRect.top,
          rect.width,
          rect.height,
        );
      }

      return rect ?? new DOMRect(0, 0, 0, 0);
    },
  };

  await computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [shift({ padding: 10 }), flip()],
  }).then(({ x, y }) => {
    Object.assign(element.style, {
      position: "fixed",
      left: `${x.toString()}px`,
      top: `${y.toString()}px`,
      pointerEvents: "auto",
      zIndex: "9999",
    });
  });
};

let activePopupEditor: Editor | null = null;

const getSuggestionOptions = (suggestionList: MessageTag[]) => {
  return {
    char: "/",
    items: ({ query }: { query: string }) => {
      const q = query.toLowerCase();

      return suggestionList.filter((item) => {
        const searchTargets = [
          item.title,
          ...(item.category?.searchBy ?? []),
        ].map((s) => s.toLowerCase());

        return searchTargets.some((t) => t.includes(q));
      });
    },
    render: () => {
      let component: ReactRenderer;
      let popup: HTMLElement;

      return {
        onStart: async (props: SuggestionProps) => {
          // If another popup is already open, don't open a second one
          if (activePopupEditor !== null) {
            return;
          }

          activePopupEditor = props.editor;

          component = new ReactRenderer(TagsList, {
            props,
            editor: props.editor,
          });

          popup = component.element;

          const handleBlur = () => {
            destroy();
          };
          const handleClickOutside = (event_: MouseEvent) => {
            if (!props.editor.view.dom.contains(event_.target as Node)) {
              destroy();
            }
          };

          function destroy() {
            activePopupEditor = null;
            popup.remove();
            component.destroy();

            props.editor.off("blur", handleBlur);
            document.removeEventListener("mousedown", handleClickOutside);
          }

          props.editor.on("blur", handleBlur);
          document.addEventListener("mousedown", handleClickOutside);

          await updatePosition(props.editor, popup, props.clientRect);
          document.body.append(popup);
          await updatePosition(props.editor, popup, props.clientRect);
        },

        async onUpdate(props: SuggestionProps) {
          if (activePopupEditor !== props.editor) {
            return;
          }

          component.updateProps(props);
          await updatePosition(props.editor, popup, props.clientRect);
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (activePopupEditor?.view !== props.view) {
            return false;
          }

          if (props.event.key === "Escape") {
            component.destroy();
            return true;
          }
          // @ts-expect-error: ReactRenderer types
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          return component.ref?.onKeyDown(props.event);
        },

        onExit() {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (popup === undefined) {
            return;
          }

          activePopupEditor = null;
          popup.remove();
          component.destroy();
        },
      };
    },
  } satisfies Omit<SuggestionOptions, "editor">;
};

export const setupSuggestions = (
  additionalTags: MessageTag[],
  t: ReturnType<typeof useTranslations<"MessageTags">>,
) => {
  const allTags = [...getMessageTags(t), ...additionalTags];

  const fixTags = (state: EditorState) => {
    const { tr } = state;

    state.doc.descendants((node, position) => {
      const id = node.attrs.id as string | null | undefined;

      if (
        node.type.name !== "mention" ||
        id == null ||
        !RESOURCE_TAG_REGEX.test(id) ||
        allTags.some((tag) => tag.value === id)
      ) {
        return;
      }

      const prefix = id.slice(0, -36);
      const sameNameTag = additionalTags.find(
        (tag) => tag.value.startsWith(prefix) && tag.title === node.attrs.label,
      );

      if (sameNameTag !== undefined) {
        tr.setNodeMarkup(position, undefined, {
          ...node.attrs,
          id: sameNameTag.value,
        });
      }
    });

    return tr.docChanged ? tr : null;
  };

  return [
    Mention.extend({
      addProseMirrorPlugins() {
        return [
          ...(this.parent?.() ?? []),
          new Plugin({
            appendTransaction: (transactions, _oldState, newState) =>
              transactions.some((transaction) => transaction.docChanged)
                ? fixTags(newState)
                : null,
          }),
        ];
      },
      onCreate() {
        const tr = fixTags(this.editor.state);

        if (tr !== null) {
          this.editor.view.dispatch(tr);
        }
      },
    }).configure({
      suggestion: {
        ...getSuggestionOptions(allTags),
      },
      HTMLAttributes: {
        class:
          "px-2 rounded-md inline-block !truncate max-w-sm align-[-0.3em] font-sans!",
      },
      renderHTML({ options, node }) {
        return [
          "span",
          mergeAttributes(options.HTMLAttributes, {
            style: getTagStyle(allTags, node.attrs.id as string),
          }),
          node.attrs.label,
        ];
      },
    }),
  ];
};
