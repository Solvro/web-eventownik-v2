import { computePosition, flip, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/core";
import { Mention } from "@tiptap/extension-mention";
import { ReactRenderer, mergeAttributes, posToDOMRect } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";

import { TagsList } from "@/components/tags-list";

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

export interface MessageTag {
  title: string;
  description: string;
  value: string;
  color: MessageTagColor;
}

const MESSAGE_TAGS: MessageTag[] = [
  {
    title: "Nazwa wydarzenia",
    description: "Pokazuje prawdziwą nazwę wydarzenia",
    value: "/event_name",
    color: "red",
  },
  {
    title: "Data rozpoczęcia",
    description: "Pokazuje datę wydarzenia",
    value: "/event_start_date",
    color: "orange",
  },
  {
    title: "Data zakończenia",
    description: "Pokazuje datę zakończenia",
    value: "/event_end_date",
    color: "yellow",
  },
  {
    title: "Slug wydarzenia",
    description: "Pokazuje slug wydarzenia",
    value: "/event_slug",
    color: "green",
  },
  {
    title: "Kolor wydarzenia",
    description: "Pokazuje wybrany kolor",
    value: "/event_primary_color",
    color: "teal",
  },
  {
    title: "E-mail uczestnika",
    description: "Pokazuje e-mail uczestnika",
    value: "/participant_email",
    color: "blue",
  },
  {
    title: "ID uczestnika",
    description: "Pokazuje ID uczestnika",
    value: "/participant_id",
    color: "indigo",
  },
  {
    title: "Slug uczestnika",
    description: "Pokazuje slug uczestnika",
    value: "/participant_slug",
    color: "purple",
  },
  {
    title: "Data rejestracji",
    description: "Pokazuje datę zarejestrowania",
    value: "/participant_created_at",
    color: "pink",
  },
];

const updatePosition = async (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  };

  await computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.pointerEvents = "auto";
    element.style.width = "256px";
    element.style.position = strategy;
    element.style.left = `${x.toString()}px`;
    element.style.top = `${y.toString()}px`;
  });
};

const getSuggestionOptions = (suggestionList: MessageTag[]) => {
  return {
    char: "/",
    items: ({ query }: { query: string }) => {
      return suggestionList.filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase()),
      );
    },
    render: () => {
      let component: ReactRenderer;

      return {
        onStart: async (props: SuggestionProps) => {
          component = new ReactRenderer(TagsList, {
            props,
            editor: props.editor,
          });

          if (props.clientRect === null) {
            return;
          }

          component.element.setAttribute("position", "absolute");

          // NOTE: Updating the position twice looks silly here, but without it
          // the suggestion list initially appears far away from the text

          await updatePosition(props.editor, component.element as HTMLElement);

          document.body.append(component.element);

          await updatePosition(props.editor, component.element as HTMLElement);
        },

        async onUpdate(props: SuggestionProps) {
          component.updateProps(props);

          if (props.clientRect === null) {
            return;
          }

          await updatePosition(props.editor, component.element as HTMLElement);
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Escape") {
            component.destroy();
            return true;
          }

          // @ts-expect-error: TODO, fix later - this was copied from TipTap docs
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return component.ref?.onKeyDown(props.event);
        },

        onExit() {
          component.element.remove();
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
        class: "px-2 py-[1px] rounded-md",
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
