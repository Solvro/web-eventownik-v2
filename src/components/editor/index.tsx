"use client";

import { Drawer, Puck, Render, useGetPuck, usePuck } from "@measured/puck";
import type { AppState, Config, PuckAction } from "@measured/puck";
import "@measured/puck/no-external.css";
import {
  Container,
  Eye,
  FoldVertical,
  Grid,
  Heading,
  Image,
  List,
  Redo2,
  Save,
  Sidebar,
  Tag,
  Type,
  Undo2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import { getPuckConfig } from "@/components/editor/config";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/participant";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PUCK_ICON_CLASSNAME } from "./common";
import type { EventData } from "./common";
import { overrides } from "./overrides";

type PuckDispatch = (action: PuckAction) => void;

const COMPONENT_ICONS = {
  Heading: <Heading className={PUCK_ICON_CLASSNAME} />,
  Paragraph: <Type className={PUCK_ICON_CLASSNAME} />,
  Grid: <Grid className={PUCK_ICON_CLASSNAME} />,
  Flex: <Container className={PUCK_ICON_CLASSNAME} />,
  Divider: <FoldVertical className={PUCK_ICON_CLASSNAME} />,
  Image: <Image className={PUCK_ICON_CLASSNAME} />,
  UnorderedList: <List className={PUCK_ICON_CLASSNAME} />,
  Tag: <Tag className={PUCK_ICON_CLASSNAME} />,
} as const satisfies Record<
  keyof ReturnType<typeof getPuckConfig>["components"],
  React.ReactElement
>;

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
    <div className="flex justify-between border-b border-[var(--event-primary-color)]/50">
      <div className="flex justify-center">
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
      <div className="flex justify-center">
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
    <ScrollArea
      className={cn(
        "max-h-[724px] w-[234px]",
        appState.ui.leftSideBarVisible ? "block" : "hidden",
      )}
    >
      <div className="space-y-4 border-r border-[var(--event-primary-color)]/50">
        <h2 className="border-b border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
          Bloki
        </h2>
        <Drawer>
          <Accordion type="multiple" className="px-4">
            {config.categories === undefined
              ? null
              : Object.keys(config.categories).map(
                  (category, categoryIndex) => {
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
                  },
                )}
          </Accordion>
        </Drawer>
        <h2 className="border-y border-[var(--event-primary-color)]/50 p-4 text-lg font-semibold">
          Schemat
        </h2>
        <div
          className={cn(
            "mb-2 max-h-[264px] overflow-y-auto",
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
    </ScrollArea>
  );
}

function FieldsPanel({ appState }: { appState: AppState }) {
  return (
    <ScrollArea
      className={cn(
        "max-h-[724px] w-[234px]",
        appState.ui.rightSideBarVisible ? "block" : "hidden",
      )}
    >
      <div
        className={cn(
          "overflow-y-auto border-l border-[var(--event-primary-color)]/50 [&>form]:w-[234px]",
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
        )}
      >
        <Puck.Fields />
      </div>
    </ScrollArea>
  );
}

function PreviewDialog({
  eventData,
  config,
}: {
  eventData: EventData;
  config: Config;
}) {
  const getPuck = useGetPuck();
  const puck = getPuck();

  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(eventData.participants[0] ?? null);

  const handleParticipantChange = (id: string) => {
    setSelectedParticipant(
      eventData.participants.find(
        (participant) => participant.id.toString() === id,
      ) ?? null,
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye />
          Podgląd
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogTitle>Podgląd</DialogTitle>
        <div className="flex gap-2">
          <div className="bg-muted/30 w-[220px] space-y-4 rounded-xl p-4">
            <p>Ustawienia podglądu</p>
            <p className="text-foreground-muted text-sm">Wyświetl jako...</p>
            <Select
              onValueChange={(value) => {
                handleParticipantChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz uczestnika" />
              </SelectTrigger>
              <SelectContent>
                {eventData.participants.map((participant) => (
                  <SelectItem
                    key={participant.id}
                    value={participant.id.toString()}
                  >
                    {participant.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="mx-auto h-128 w-2xl bg-white px-6 font-[system-ui] text-black">
            <Render
              metadata={{
                isPreview: true,
                targetPreviewParticipant: selectedParticipant,
              }}
              data={puck.appState.data}
              config={config}
            />
          </ScrollArea>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zamknij</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Client component containing all of custom compositional Puck editor UI. It's a wrapper that easily allows access to Puck's API for custom components by using `usePuck` hook.
 * This component must be rendered within `<Puck/>` component, so we use it within the "root" `<EmailEditor/>` component as a child of `<Puck/>`
 */
function PuckComposition({
  config,
  eventData,
}: {
  config: Config;
  eventData: EventData;
}) {
  // TODO(refactor): Suboptimal for performance
  const { appState, dispatch, history } = usePuck();

  return (
    <div className="flex h-[835px] flex-col">
      <div className="mb-2 flex justify-between">
        <h1 className="mb-4 text-3xl font-bold">Edytor szablonu</h1>
        <div className="flex gap-2">
          <PreviewDialog eventData={eventData} config={config} />
          <SaveButton {...appState} />
        </div>
      </div>
      <div className="flex h-[835px] grow flex-col rounded-xl border border-[var(--event-primary-color)]/50 bg-[var(--event-primary-color)]/10">
        <Toolbar appState={appState} dispatch={dispatch} history={history} />
        <div className="flex max-h-[724px] grow">
          <BlocksAndSchemaSidebar config={config} appState={appState} />
          <div className="flex grow bg-white px-8 py-2 font-[system-ui]">
            <div className="mx-auto flex max-w-2xl grow flex-col gap-2">
              <div className="pointer-events-none flex items-center gap-2 py-2 text-xl text-black">
                <p className="text-2xl">Tytuł wiadomości</p>
                <div className="flex items-center gap-2 rounded-md bg-slate-200 p-1 text-xs">
                  Odebrane <X className="size-3 stroke-3 align-middle" />
                </div>
              </div>
              <div className="pointer-events-none flex items-center gap-2">
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
              <div className="w-full grow">
                <Puck.Preview />
              </div>
            </div>
          </div>
          <FieldsPanel appState={appState} />
        </div>
      </div>
    </div>
  );
}

const data = {
  root: {
    props: {},
  },
  content: [
    {
      type: "Flex",
      props: {
        content: [
          {
            type: "Heading",
            props: {
              id: "Heading-30c77aea-4bc0-4a3e-ab9f-6d2d2dfde3b4",
              title: "Rekrutacja do koła naukowego XYZ",
              level: 1,
              typography: {
                fontWeight: "700",
                textAlign: "left",
                fontSize: 24,
                color: "inherit",
              },
            },
          },
        ],
        direction: "row",
        align: "center",
        justify: "center",
        gap: 16,
        layout: {
          width: "auto",
          height: "auto",
          margin: "0",
          padding: "0",
        },
        appearance: {
          color: "#ffffff",
          backgroundColor: "#FFFFFF",
          image: {
            backgroundImage:
              "https://media.istockphoto.com/id/2157501069/photo/abstract-dynamic-background-with-bokeh-light.jpg?b=1&s=612x612&w=0&k=20&c=CgyjnlT757M70tG06ve5qlb7ckbQQ-Wp1SqRFHzbwhM=",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          },
        },
        id: "Flex-8c7a7afc-7865-49b2-8c0b-b4c69b2f4da9",
      },
    },
    {
      type: "Paragraph",
      props: {
        content: "Serdecznie zapraszamy do naszego koła naukowego!",
        typography: {
          fontWeight: "700",
          textAlign: "center",
          fontSize: 16,
          color: "inherit",
        },
        id: "Paragraph-a347e3aa-e923-4fb1-958d-bb67ba23dfae",
      },
    },
    {
      type: "Paragraph",
      props: {
        content:
          "Hej! 👋 Dołącz do naszego Koła Naukowego i zdobądź praktyczne doświadczenie w fascynujących eksperymentach oraz projektach. To świetna okazja, by rozwijać swoje zainteresowania naukowe w przyjaznym i inspirującym środowisku. Poznasz nowych ludzi, którzy podzielają Twoją ciekawość świata i pasję do odkrywania.\n\nNiezależnie od tego, czy dopiero zaczynasz swoją przygodę z nauką, czy jesteś już zaprawionym eksperymentatorem, znajdziesz u nas coś dla siebie. Nasze spotkania łączą naukę z dobrą zabawą i możliwością pracy zespołowej. Nie przegap szansy, by dołączyć do społeczności pełnej ciekawych umysłów i ekscytujących projektów!\n",
        typography: {
          fontWeight: "400",
          textAlign: "left",
          fontSize: 14,
          color: "inherit",
        },
        id: "Paragraph-75e2eb9a-edce-4132-a1bb-a5cf5cf6c2c2",
      },
    },
    {
      type: "Paragraph",
      props: {
        content: "Co da ci dołączenie do naszego koła?",
        typography: {
          fontWeight: "700",
          textAlign: "center",
          fontSize: 16,
          color: "inherit",
        },
        id: "Paragraph-34045ad2-6b09-4aa0-80bd-5b1f065c7923",
      },
    },
    {
      type: "Grid",
      props: {
        content: [
          {
            type: "Flex",
            props: {
              content: [
                {
                  type: "Image",
                  props: {
                    id: "Image-fdac14e4-30d3-4d34-8ff6-f544491a3b1c",
                    src: "https://media.istockphoto.com/id/1136617599/photo/old-friends-meeting-three-friends-meet-in-pub.jpg?s=612x612&w=0&k=20&c=PuF3h32kZbeDzvqdU1hqBBJna7Np3kCrFr18MzMJVcU=",
                    alt: "",
                    objectFit: "contain",
                    layout: {
                      width: "128",
                      height: "128",
                      margin: "0",
                      padding: "0",
                    },
                  },
                },
                {
                  type: "Paragraph",
                  props: {
                    id: "Paragraph-7acfd45e-9c0e-4afd-8778-f1e9058aaa8b",
                    content: "Poznanie nowych osób",
                    typography: {
                      fontWeight: "400",
                      textAlign: "left",
                      fontSize: 16,
                      color: "inherit",
                    },
                  },
                },
              ],
              id: "Flex-3e83352b-d6d7-493c-91aa-dfe9fa8ad72d",
              direction: "column",
              align: "center",
              justify: "center",
              gap: 16,
              layout: {
                width: "auto",
                height: "auto",
                margin: "0",
                padding: "0",
              },
              appearance: {
                color: "#000000",
                backgroundColor: "#b8bafa",
                image: {
                  backgroundImage: "",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                },
              },
            },
          },
          {
            type: "Flex",
            props: {
              content: [
                {
                  type: "Image",
                  props: {
                    id: "Image-ca97bdf2-4e06-4708-aa5a-c225dac8a5fe",
                    src: "https://media.istockphoto.com/id/1395838918/photo/colleague-mentoring-younger-associate-in-business-office-while-pointing-at-data-on-computer.jpg?s=612x612&w=0&k=20&c=9tllwSQdSs955_6LJ3pivudXSRdc1ydXAjdtmRzolm4=",
                    alt: "",
                    objectFit: "contain",
                    layout: {
                      width: "128",
                      height: "128",
                      margin: "0",
                      padding: "0",
                    },
                  },
                },
                {
                  type: "Paragraph",
                  props: {
                    id: "Paragraph-920407dc-43ac-44d8-aedb-a51a56a36c32",
                    content: "Praktyczne doświadczenie",
                    typography: {
                      fontWeight: "400",
                      textAlign: "left",
                      fontSize: 16,
                      color: "inherit",
                    },
                  },
                },
              ],
              id: "Flex-7df19fff-8100-42f8-aaf7-60eb01273c6b",
              direction: "column",
              align: "center",
              justify: "center",
              gap: 16,
              layout: {
                width: "auto",
                height: "auto",
                margin: "0",
                padding: "0",
              },
              appearance: {
                color: "#000000",
                backgroundColor: "#b8bafa",
                image: {
                  backgroundImage: "",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                },
              },
            },
          },
          {
            type: "Flex",
            props: {
              content: [
                {
                  type: "Image",
                  props: {
                    id: "Image-b3d1a1c7-5c96-49ee-aa15-f01a932bc887",
                    src: "https://media.istockphoto.com/id/1136617599/photo/old-friends-meeting-three-friends-meet-in-pub.jpg?s=612x612&w=0&k=20&c=PuF3h32kZbeDzvqdU1hqBBJna7Np3kCrFr18MzMJVcU=",
                    alt: "",
                    objectFit: "contain",
                    layout: {
                      width: "128",
                      height: "128",
                      margin: "0",
                      padding: "0",
                    },
                  },
                },
                {
                  type: "Paragraph",
                  props: {
                    id: "Paragraph-cc952de2-c767-4aa7-97cb-a2cf572a22e8",
                    content: "Poznanie nowych osób",
                    typography: {
                      fontWeight: "400",
                      textAlign: "left",
                      fontSize: 16,
                      color: "inherit",
                    },
                  },
                },
              ],
              id: "Flex-8879c62f-cbe8-4104-98f2-6434de198e47",
              direction: "column",
              align: "center",
              justify: "center",
              gap: 16,
              layout: {
                width: "auto",
                height: "auto",
                margin: "0",
                padding: "0",
              },
              appearance: {
                color: "#000000",
                backgroundColor: "#b8bafa",
                image: {
                  backgroundImage: "",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                },
              },
            },
          },
        ],
        columns: 3,
        columnGap: 16,
        rows: 1,
        rowGap: 16,
        layout: {
          width: "auto",
          height: "auto",
          margin: "0",
          padding: "0",
        },
        appearance: {
          color: "#000000",
          backgroundColor: "#FFFFFF",
          image: {
            backgroundImage: "",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          },
        },
        id: "Grid-e7a89bf1-3d64-4c8b-ab41-7b80df9ff974",
      },
    },
  ],
  zones: {},
};

function EmailEditor({ eventData }: { eventData: EventData }) {
  const config = getPuckConfig(eventData);
  return (
    <Puck
      config={config}
      data={data}
      overrides={{
        ...overrides,
        iframe: ({ children, document }) => {
          if (document !== undefined) {
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
            document.body.style.fontFamily = "Arial, system-ui, sans-serif";
          }
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{children}</>;
        },
      }}
      onPublish={(test) => {
        // eslint-disable-next-line no-console
        console.log(test);
      }}
    >
      <PuckComposition config={config} eventData={eventData} />
    </Puck>
  );
}

export { EmailEditor };
