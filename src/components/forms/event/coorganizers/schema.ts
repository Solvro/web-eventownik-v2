import { z } from "zod";

export const EventCoorganizersFormSchema = z.object({
  coorganizers: z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
      permissions: z.array(
        z.enum([
          "MANAGE_ALL",
          "MANAGE_EVENT",
          "MANAGE_SETTINGS",
          "MANAGE_FORM",
          "MANAGE_PARTICIPANT",
          "MANAGE_EMAIL",
        ]),
      ),
    }),
  ),
});
