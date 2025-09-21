"use client";

import { Drawer, Puck, usePuck } from "@measured/puck";
import type { AppState, Config, PuckAction } from "@measured/puck";
import "@measured/puck/no-external.css";
import {
  Container,
  FoldVertical,
  Grid,
  Heading,
  Image,
  List,
  Redo2,
  Save,
  Sidebar,
  Type,
  Undo2,
  User,
  X,
} from "lucide-react";

import type { config } from "@/app/dashboard/events/[id]/emails/editor/page";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PUCK_ICON_CLASSNAME } from "./common";

type PuckDispatch = (action: PuckAction) => void;

const COMPONENT_ICONS = {
  Heading: <Heading className={PUCK_ICON_CLASSNAME} />,
  Paragraph: <Type className={PUCK_ICON_CLASSNAME} />,
  Grid: <Grid className={PUCK_ICON_CLASSNAME} />,
  Flex: <Container className={PUCK_ICON_CLASSNAME} />,
  Divider: <FoldVertical className={PUCK_ICON_CLASSNAME} />,
  Image: <Image className={PUCK_ICON_CLASSNAME} />,
  UnorderedList: <List className={PUCK_ICON_CLASSNAME} />,
} satisfies Record<keyof typeof config.components, React.ReactElement>;

/**
 * NOTE: Temporary addition during the development of the editor.
 * Used to display current document schema.
 */
function SaveButton(appState: AppState) {
  // eslint-disable-next-line no-console
  console.log("save button re-render");
  return (
    <Button
      variant="outline"
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log(appState.data);
      }}
    >
      <Save />
      Zapisz
    </Button>
  );
}

/**
 * NOTE: Zooming in this component is handled through `useState` instead of hooking into
 * Puck's API - in this case, `viewport`. Since other components use it (such as undo/redo buttons here), shouldn't
 * it be utilized here as well? Current implementation seems more straightforward.
 */
function Toolbar({
  appState,
  dispatch,
  history,
}: {
  appState: AppState;
  dispatch: PuckDispatch;
  history: ReturnType<typeof usePuck>["history"];
}) {
  const leftVisible = appState.ui.leftSideBarVisible;
  const rightVisible = appState.ui.rightSideBarVisible;
  const { back, forward, hasFuture, hasPast } = history;

  return (
    <div className="grid grid-cols-[1fr_3fr_1fr] border-b border-[var(--event-primary-color)]/50">
      <div className="flex justify-center border-r border-[var(--event-primary-color)]/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={() => {
                dispatch({
                  type: "setUi",
                  ui: {
                    leftSideBarVisible: !leftVisible,
                  },
                });
              }}
            >
              <Sidebar />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {leftVisible ? "Ukryj" : "Wyświetl"} lewy panel
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={() => {
                dispatch({
                  type: "setUi",
                  ui: {
                    rightSideBarVisible: !rightVisible,
                  },
                });
              }}
            >
              <Sidebar className="scale-[-1_-1]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {rightVisible ? "Ukryj" : "Wyświetl"} prawy panel
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-lg">Nazwa szablonu</p>
      </div>
      <div className="flex justify-center border-l border-[var(--event-primary-color)]/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="eventGhost" onClick={back} disabled={!hasPast}>
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cofnij</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={forward}
              disabled={!hasFuture}
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ponów</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function BlocksAndSchemaSidebar({
  config,
  appState,
}: {
  appState: AppState;
  config: Config;
}) {
  return (
    <div
      className={cn(
        "space-y-4 border-r border-[var(--event-primary-color)]/50",
        appState.ui.leftSideBarVisible ? "block" : "hidden",
      )}
    >
      <h2 className="border-b border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
        Bloki
      </h2>
      <Drawer>
        <Accordion type="multiple" className="px-4">
          {config.categories === undefined
            ? null
            : Object.keys(config.categories).map((category, categoryIndex) => {
                const categoryLabel =
                  config.categories === undefined
                    ? null
                    : Object.values(config.categories)[categoryIndex].title;
                const components =
                  config.categories === undefined
                    ? []
                    : (Object.values(config.categories)[categoryIndex]
                        .components ?? []);
                return (
                  <AccordionItem
                    value={category}
                    key={category}
                    className="border-none"
                  >
                    <AccordionTrigger className="text-muted-foreground">
                      {categoryLabel}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      {components.map((component) => {
                        const componentLabel =
                          config.components[component].label;
                        return (
                          <Drawer.Item name={component} key={component}>
                            {() => (
                              <Button
                                asChild
                                size="sm"
                                variant="eventDefault"
                                className="flex w-full items-center justify-between gap-2 py-2"
                              >
                                <div>
                                  {
                                    COMPONENT_ICONS[
                                      component as keyof typeof COMPONENT_ICONS
                                    ]
                                  }
                                  {componentLabel}
                                </div>
                              </Button>
                            )}
                          </Drawer.Item>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
        </Accordion>
      </Drawer>
      <h2 className="border-y border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
        Schemat
      </h2>
      <div
        className={cn(
          "max-h-[264px] overflow-y-auto",
          // Outline list (ul - "_LayerTree")
          "[&>div>ul]:space-y-2 [&>div>ul]:px-4!",
          // Outline list item (outer element - "_Layer")
          "[&>div>ul>li]:border-[var(--event-primary-color)]/20!",
          // Outline list item content (root element for each item - "_Layer-inner")
          "[&>div>ul>li>div]:text-foreground! [&>div>ul>li>div]:bg-[var(--event-primary-color)]/10! [&>div>ul>li>div:hover]:border-[var(--event-primary-color)]/60!",
          // Outline list item button (wrapper for items below - "_Layer-clickable")
          // Icon - "_Layer-icon")
          "[&>div>ul>li>div>button>div>div>svg]:mb-1! [&>div>ul>li>div>button>div>div>svg]:stroke-[var(--event-primary-color)]!",
          // Children of slot type component dropdown (as in layout blocks)
          "[&>div>ul>li>div:nth-child(2)>ul>li>div]:text-foreground! [&>div>ul>li>div:nth-child(2)>ul>li>div]:bg-[var(--event-primary-color)]/10! [&>div>ul>li>div:nth-child(2)>ul>li>div:hover]:border-[var(--event-primary-color)]/60!",
          "[&>div>ul>li>div:nth-child(2)>ul>li>div>button>div>div>svg]:mb-1! [&>div>ul>li>div:nth-child(2)>ul>li>div>button>div>div>svg]:stroke-[var(--event-primary-color)]!",
          // Background of slot type component dropdown ("BLOKI W KONTENERZE")
          "[&>div>ul>li>div:nth-child(2)]:bg-transparent!",
        )}
      >
        <Puck.Outline />
      </div>
    </div>
  );
}

function FieldsPanel({ appState }: { appState: AppState }) {
  return (
    <div
      className={cn(
        "max-h-[724px] w-[234px] overflow-y-auto border-l border-[var(--event-primary-color)]/50",
        // Each field entry - outside of field groups, exclusive to block (e.g. no. of columns in grid)
        "[&>form_label>div]:text-muted-foreground! [&>form>div]:border-[var(--event-primary-color)]/50!",
        // All field groups containers (as in commons - e.g. the div holding font size field in case of typography)
        "[&>form_div>div>div>div:nth-of-type(2)]:border-none! [&>form_div>div>div>div:nth-of-type(2)]:bg-[var(--event-primary-color)]/2!",
        // Nested field groups containers (in case of an object field within another object field - e.g. background image in appearance)
        "[&>form_div>div>div>div:nth-of-type(2)_div>div:nth-of-type(2)]:border-none! [&>form_div>div>div>div:nth-of-type(2)_div>div:nth-of-type(2)]:bg-[var(--event-primary-color)]/2!",
        // Labels of field groups
        "[&>form>div_div>div]:text-muted-foreground!",
        // Fields of type "array"
        "[&>form>div_div>div>div>div>div_button>svg]:stroke-foreground! [&>form_fieldset]:border-none! [&>form>div_div]:border-[var(--event-primary-color)]/20! [&>form>div_div>div>div>div>div]:bg-[var(--event-primary-color)]/10! [&>form>div_div>div>div>div>div_button]:bg-transparent! [&>form>div_div>div>div>div>div_button]:hover:bg-[var(--event-primary-color)]! [&>form>div_div>div>div>div>div>div>div]:bg-transparent!",
        // 'Add item to array field' button
        "[&>form>div>div>div>div>button]:border-[var(--event-primary-color)]/20! [&>form>div>div>div>div>button]:bg-[var(--event-primary-color)]/20! [&>form>div>div>div>div>button_svg]:stroke-[var(--event-primary-color)]!",
        appState.ui.rightSideBarVisible ? "block" : "hidden",
      )}
    >
      <Puck.Fields />
    </div>
  );
}

/**
 * Client component containing all of custom Puck editor UI.
 * It's a wrapper that easily allows access to Puck's API for custom components by using `usePuck` hook.
 * This component must be rendered within `<Puck/>` component.
 */
function PuckComposition({ config }: { config: Config }) {
  // TODO(refactor): Suboptimal for performance
  const { appState, dispatch, history } = usePuck();

  return (
    <div className="flex h-[835px] flex-col">
      <div className="mb-2 flex justify-between">
        <h1 className="mb-4 text-3xl font-bold">Edytor szablonu</h1>
        <SaveButton {...appState} />
      </div>
      <div className="flex h-[835px] grow flex-col rounded-xl border border-[var(--event-primary-color)]/50 bg-[var(--event-primary-color)]/10">
        <Toolbar appState={appState} dispatch={dispatch} history={history} />
        <div
          className="grid grow"
          style={{
            gridTemplateColumns: `${appState.ui.leftSideBarVisible ? "1fr" : ""} 3fr ${appState.ui.rightSideBarVisible ? "1fr" : ""}`,
          }}
        >
          <BlocksAndSchemaSidebar config={config} appState={appState} />
          <div className="flex max-h-[724px] flex-col gap-2 bg-white font-[system-ui]">
            <div className="pointer-events-none flex items-center gap-2 px-14 py-2 text-xl text-black">
              <p>Tytuł wiadomości</p>
              <div className="flex items-center gap-2 rounded-md bg-slate-200 p-1 text-xs">
                Odebrane <X className="size-3 stroke-3 align-middle" />
              </div>
            </div>
            <div className="pointer-events-none flex items-center gap-2 px-4">
              <div className="rounded-full bg-slate-200 p-2">
                <User />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">
                  Nazwa wydarzenia
                  <span className="text-muted-foreground ml-2 font-normal">
                    {"<eventownik@solvro.pl>"}
                  </span>
                </p>
              </div>
            </div>
            <div className="max-w-7xl grow px-4">
              <Puck.Preview />
            </div>
          </div>
          <FieldsPanel appState={appState} />
        </div>
      </div>
    </div>
  );
}

export { PuckComposition };
