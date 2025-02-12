import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerFormSchema = loginFormSchema.extend({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
});
