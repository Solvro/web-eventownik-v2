"use client";

import { Puck } from "@measured/puck";
import type { Config } from "@measured/puck";
import "@measured/puck/no-external.css";
import { ALargeSmall, Type } from "lucide-react";
import type React from "react";

// interface WithTypography {
//   textAlign: {
//     type: "radio";
//     options: [
//       { label: "Lewo"; value: "left" },
//       { label: "Środek"; value: "center" },
//       { label: "Prawo"; value: "right" },
//       { label: "Justuj"; value: "justify" },
//     ];
//   };
// }

interface Components {
  Heading: {
    title: string;
    level: string;
  };
  Paragraph: {
    content: string;
  };
}

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

export const config: Config<Components> = {
  components: {
    Heading: {
      label: "Nagłówek",
      fields: {
        title: {
          type: "text",
          label: "Treść",
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
        level: "1",
      },
      render: ({ level, title }) => {
        return (
          <div style={{ padding: 24 }}>
            <Heading level={Number.parseInt(level)} title={title} />
          </div>
        );
      },
    },
    Paragraph: {
      label: "Paragraf",
      fields: {
        content: {
          type: "text",
          label: "Treść",
          labelIcon: <Type className="size-6" />,
        },
      },
      defaultProps: {
        content: "Lorem ipsum dolor sit amet",
      },
      render: ({ content }) => {
        return (
          <div style={{ padding: 24 }}>
            <p>{content}</p>
          </div>
        );
      },
    },
  },
  categories: {
    typography: {
      title: "Tekst",
      components: ["Heading", "Paragraph"],
    },
  },
};

// Describe the initial data
const initialData = {};

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
