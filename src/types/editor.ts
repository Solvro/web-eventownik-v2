import type { Config, Slot } from "@puckeditor/core";
import type { CSSProperties } from "react";

import type {
  AppearanceFields,
  LayoutFields,
} from "@/components/editor/common";
import type { EMAIL_TRIGGERS } from "@/lib/emails";

import type { LooseAutocomplete } from "./utils";

export interface ImageFields extends LayoutFields {
  src: string;
  alt: string;
  objectFit: CSSProperties["objectFit"];
}

export interface ContainerFields extends LayoutFields, AppearanceFields {
  columns: Record<"content", Slot>[];
  numZones: number;
}

export interface TwoByTwoFields extends LayoutFields, AppearanceFields {
  topLeft: Slot;
  topRight: Slot;
  bottomLeft: Slot;
  bottomRight: Slot;
}

export interface TwoByOneFields extends LayoutFields, AppearanceFields {
  left: Slot;
  right: Slot;
}

export interface ThreeByOneFields extends LayoutFields, AppearanceFields {
  left: Slot;
  center: Slot;
  right: Slot;
}

export interface FourByOneFields extends LayoutFields, AppearanceFields {
  col1: Slot;
  col2: Slot;
  col3: Slot;
  col4: Slot;
}

export interface ThreeByTwoFields extends LayoutFields, AppearanceFields {
  topLeft: Slot;
  topCenter: Slot;
  topRight: Slot;
  bottomLeft: Slot;
  bottomCenter: Slot;
  bottomRight: Slot;
}

export interface ThreeByThreeFields extends LayoutFields, AppearanceFields {
  topLeft: Slot;
  topCenter: Slot;
  topRight: Slot;
  middleLeft: Slot;
  middleCenter: Slot;
  middleRight: Slot;
  bottomLeft: Slot;
  bottomCenter: Slot;
  bottomRight: Slot;
}

export interface DividerFields extends AppearanceFields {
  height: string;
}

export interface RichTextFields {
  content: string;
}

export interface LinkFields extends AppearanceFields {
  title: string;
  href: string;
  target: "_blank" | "_self";
}

export interface PuckComponents {
  RichText: RichTextFields;
  Container: ContainerFields;
  TwoByTwo: TwoByTwoFields;
  TwoByOne: TwoByOneFields;
  ThreeByOne: ThreeByOneFields;
  FourByOne: FourByOneFields;
  ThreeByTwo: ThreeByTwoFields;
  ThreeByThree: ThreeByThreeFields;
  Divider: DividerFields;
  Image: ImageFields;
  Link: LinkFields;
}

export interface RootSettings {
  name: string;
  title: string;
  trigger: LooseAutocomplete<(typeof EMAIL_TRIGGERS)[number]["value"]>;
  triggerValue?: string;
  triggerValue2?: string;
}

export type PuckConfig = Config<PuckComponents, RootSettings>;
