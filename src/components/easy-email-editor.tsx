"use client";

import { AdvancedType, BasicType, BlockManager } from "easy-email-core";
import { EmailEditor, EmailEditorProvider } from "easy-email-editor";
import "easy-email-editor/lib/style.css";
import type { ExtensionProps } from "easy-email-extensions";
import { StandardLayout } from "easy-email-extensions";
import "easy-email-extensions/lib/style.css";

import "@/app/test.css";

const initialValues = {
  subject: "Welcome to Easy-email",
  subTitle: "Nice to meet you!",
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
};

const defaultCategories: ExtensionProps["categories"] = [
  {
    label: "Content",
    active: true,
    blocks: [
      {
        type: AdvancedType.TEXT,
      },
      {
        type: AdvancedType.IMAGE,
      },
      {
        type: AdvancedType.BUTTON,
      },
      {
        type: AdvancedType.SOCIAL,
      },
      {
        type: AdvancedType.DIVIDER,
      },
      {
        type: AdvancedType.SPACER,
      },
      {
        type: AdvancedType.HERO,
      },
      {
        type: AdvancedType.WRAPPER,
      },
      {
        type: AdvancedType.TABLE,
      },
    ],
  },
  {
    label: "Layout",
    active: true,
    displayType: "column",
    blocks: [
      {
        title: "2 columns",
        payload: [
          ["50%", "50%"],
          ["33%", "67%"],
          ["67%", "33%"],
          ["25%", "75%"],
          ["75%", "25%"],
        ],
      },
      {
        title: "3 columns",
        payload: [
          ["33.33%", "33.33%", "33.33%"],
          ["25%", "25%", "50%"],
          ["50%", "25%", "25%"],
        ],
      },
      {
        title: "4 columns",
        payload: [["25%", "25%", "25%", "25%"]],
      },
    ],
  },
];

function EasyEmailEditor() {
  return (
    <EmailEditorProvider
      data={initialValues}
      height={"calc(100vh - 72px)"}
      autoComplete
      dashed={false}
    >
      {() => {
        return (
          <StandardLayout categories={defaultCategories} showSourceCode={true}>
            <EmailEditor />
          </StandardLayout>
        );
      }}
    </EmailEditorProvider>
  );
}

export { EasyEmailEditor };
