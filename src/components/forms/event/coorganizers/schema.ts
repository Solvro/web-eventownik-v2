import { z } from "zod";

import type { Permission } from "@/types/co-organizer";

export const EventCoorganizersFormSchema = z.object({
  coorganizers: z.array(
    z.object({
      id: z.string(),
      email: z.string().email(),
      permissions: z.array(z.custom<Permission>()),
    }),
  ),
});
