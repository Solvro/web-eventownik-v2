import { computePosition, flip, shift } from "@floating-ui/dom";
import { Mention } from "@tiptap/extension-mention";
import { ReactRenderer, mergeAttributes } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import { Calendar, FileSpreadsheet, Tag, User } from "lucide-react";

import { TagsList } from "@/components/tags-list";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

type LooseAutocomplete<T extends string> = T | (string & {});
type MessageTagColor = LooseAutocomplete<
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
>;

interface MessageTagCategory {
  title: string;
  searchBy: string[];
  icon: React.ReactNode;
}

export interface MessageTag {
  title: string;
  description: string;
  value: string;
  color: MessageTagColor;
  category?: MessageTagCategory;
}

const CATEGORY_ICON_CLASSNAME = "size-4";

const EVENT_CATEGORY: MessageTagCategory = {
  title: "Wydarzenie",
  searchBy: ["wydarzenie"],
  icon: <Calendar className={CATEGORY_ICON_CLASSNAME} />,
};

const PARTICIPANT_CATEGORY: MessageTagCategory = {
  title: "Uczestnik",
  searchBy: ["uczestnik"],
  icon: <User className={CATEGORY_ICON_CLASSNAME} />,
};

export const ATTRIBUTE_CATEGORY: MessageTagCategory = {
  title: "Atrybut",
  searchBy: ["atrybut"],
  icon: <Tag className={CATEGORY_ICON_CLASSNAME} />,
};

export const FORM_CATEGORY: MessageTagCategory = {
  title: "Formularz",
  searchBy: ["formularz"],
  icon: <FileSpreadsheet className={CATEGORY_ICON_CLASSNAME} />,
};

const MESSAGE_TAGS: MessageTag[] = [
  {
    title: "Nazwa wydarzenia",
    description: "Zamienia się w prawdziwą nazwę wydarzenia",
    value: "/event_name",
    color: "red",
    category: EVENT_CATEGORY,
  },
  {
    title: "Data rozpoczęcia",
    description: "Zamienia się w datę rozpoczęcia wydarzenia",
    value: "/event_start_date",
    color: "orange",
    category: EVENT_CATEGORY,
  },
  {
    title: "Data zakończenia",
    description: "Zamienia się w datę zakończenia wydarzenia",
    value: "/event_end_date",
    color: "yellow",
    category: EVENT_CATEGORY,
  },
  {
    title: "Email uczestnika",
    description: "Zamienia się w email uczestnika",
    value: "/participant_email",
    color: "blue",
    category: PARTICIPANT_CATEGORY,
  },
  {
    title: "Data rejestracji",
    description:
      "Zamienia się w datę zarejestrowania się uczestnika na wydarzenie",
    value: "/participant_created_at",
    color: "pink",
    category: PARTICIPANT_CATEGORY,
  },
];

/**
 * NOTE: This function assumes that the TipTap editor with Tags extensions mounted is located in a Puck editor instance
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
        !rect ||
        (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0);

      if (isInvalidRect) {
        const { from } = editor.state.selection;
        const cursorRect = editor.view.coordsAtPos(from);
        rect = new DOMRect(cursorRect.left, cursorRect.top, 0, 0);
      }

      const iframeWindow = editor.view.dom.ownerDocument.defaultView;

      if (iframeWindow?.frameElement && rect) {
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
          component = new ReactRenderer(TagsList, {
            props,
            editor: props.editor,
          });

          popup = component.element;

          await updatePosition(props.editor, popup, props.clientRect);

          document.body.append(popup);

          await updatePosition(props.editor, popup, props.clientRect);
        },

        async onUpdate(props: SuggestionProps) {
          component.updateProps(props);
          await updatePosition(props.editor, popup, props.clientRect);
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Escape") {
            component.destroy();
            return true;
          }
          // @ts-expect-error: ReactRenderer types
          return component.ref?.onKeyDown(props.event);
        },

        onExit() {
          popup.remove();
          component.destroy();
        },
      };
    },
  } satisfies Omit<SuggestionOptions, "editor">;
};

const getTagStyle = (allTags: MessageTag[], tagValue: string) => {
  const color = allTags.find((tag) => tag.value === tagValue)?.color;
  return color === undefined
    ? "color: var(--accent-foreground); background-color: var(--accent)"
    : `color: var(--tag-${color}-text); background-color: var(--tag-${color}-bg)`;
};

const setupSuggestions = (additionalTags: MessageTag[]) => {
  const allTags = [...MESSAGE_TAGS, ...additionalTags];
  return [
    Mention.configure({
      suggestion: {
        ...getSuggestionOptions(allTags),
      },
      HTMLAttributes: {
        class:
          "px-2 rounded-md inline-block !truncate max-w-sm align-[-0.45em]",
      },
      renderHTML({ options, node }) {
        return [
          "span",
          mergeAttributes(
            {
              style: getTagStyle(allTags, node.attrs.id as string),
            },
            options.HTMLAttributes,
          ),
          node.attrs.label,
        ];
      },
    }),
  ];
};

export { setupSuggestions, MESSAGE_TAGS };
