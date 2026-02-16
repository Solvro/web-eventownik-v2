"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";

import { PuckComposition } from "@/components/editor/composition";
import { puckConfig } from "@/components/editor/config";
import { overrides } from "@/components/editor/overrides";

// Describe the initial data
const initialData = {};

// Render Puck editor
export default function Editor() {
  return (
    <Puck
      config={puckConfig}
      data={initialData}
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
      <PuckComposition config={puckConfig} />
    </Puck>
  );
}
