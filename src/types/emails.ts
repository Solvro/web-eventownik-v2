/** Local email editor state used to build a native v3 write payload. */
export interface UpdateEventEmailPayload {
  name: string;
  content: string;
  schema: string | null;
  trigger: string;
  triggerValue: string | null;
  triggerValue2?: string | null;
}
