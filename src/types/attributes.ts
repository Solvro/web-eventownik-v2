export interface AttributeBase {
  id: number;
  name: string;
  value: string;
  slug: string;
}

export interface Attribute extends Omit<AttributeBase, "value"> {
  eventId: number;
  showInList: boolean;
  options: string[] | null;
  //TODO string enum values
  type: AttributeType;
  createdAt: string;
  updatedAt: string;
}

export type AttributeType =
  | "text"
  | "number"
  | "file"
  | "select"
  | "block"
  | "date"
  | "time"
  | "datetime"
  | "email"
  | "tel"
  | "color"
  | "checkbox";
