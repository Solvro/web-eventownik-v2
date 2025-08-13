"use client";

import { Puck } from "@measured/puck";
import type { Config } from "@measured/puck";
import "@measured/puck/puck.css";
import { ALargeSmall, AlertCircle, Tag, Type } from "lucide-react";
import type React from "react";

interface Props {
  Heading: Record<string, string>;
  Tag: Record<string, string>;
}

const EVENT_TAGS = new Map<string, string>([
  ["event_name", "Nazwa wydarzenia"],
  ["event_start_date", "Data rozpoczęcia wydarzenia"],
  ["event_end_date", "Data zakończenia wydarzenia"],
]);

function Heading({ title, level }: { title: string; level: number }) {
  switch (level) {
    case 1: {
      return <h1>{title}</h1>;
    }
    case 2: {
      return <h2>{title}</h2>;
    }
    case 3: {
      return <h3>{title}</h3>;
    }
    default: {
      return <h1>{title}</h1>;
    }
  }
}

export const config: Config<Props> = {
  components: {
    Heading: {
      label: "Nagłówek",
      fields: {
        title: {
          type: "text",
          label: "Treść",
          // Customowe ikonki z lucide!!!
          labelIcon: <Type className="size-6" />,
        },
        level: {
          type: "select",
          label: "Stopień",
          labelIcon: <ALargeSmall className="size-6" />,
          options: [
            {
              label: "1",
              value: 1,
            },
            {
              label: "2",
              value: 2,
            },
            {
              label: "3",
              value: 3,
            },
          ],
        },
      },
      defaultProps: {
        title: "Nagłówek",
      },
      render: ({ level, title }) => {
        return (
          <div style={{ padding: 24 }}>
            <Heading level={Number.parseInt(level)} title={title} />
          </div>
        );
      },
    },
    Tag: {
      label: "Znacznik",
      fields: {
        tagType: {
          type: "select",
          label: "Rodzaj znacznika",
          labelIcon: <Tag className="size-6" />,
          options: [
            {
              label: "Nazwa wydarzenia",
              value: "event_name",
            },
            {
              label: "Data rozpoczęcia wydarzenia",
              value: "event_start_date",
            },
            {
              label: "Data zakończenia wydarzenia",
              value: "event_end_date",
            },
          ],
        },
      },
      render: ({ tagType }) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return tagType === undefined ? (
          <div className="m-2 flex items-center gap-2 rounded-md bg-slate-900 px-2 py-4 text-slate-200">
            <AlertCircle className="size-4" />
            Wybierz rodzaj znacznika
          </div>
        ) : (
          <div
            className="m-2 rounded-md bg-amber-800 px-2 py-4 text-amber-200"
            data-tag={tagType}
          >
            {EVENT_TAGS.get(tagType)}
          </div>
        );
      },
    },
  },
};

// Describe the initial data
const initialData = {};

// Save the data to your database
// function here

// Render Puck editor
export default function Editor() {
  return (
    <Puck
      config={config}
      data={initialData}
      onPublish={(test) => {
        // eslint-disable-next-line no-alert
        alert("See the document data in the console");
        // eslint-disable-next-line no-console
        console.log(test);
      }}
    />
  );
}
