export interface EventAttribute {
  id: number;
  name: string;
  slug: string;
  eventId: number;
  options: Record<string, unknown>;
  type: string;
  rootBlockId: number;
  showInList: boolean;
  createdAt: string;
  updatedAt: string;
}
