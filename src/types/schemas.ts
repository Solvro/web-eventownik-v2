import { z } from "zod";

export type AuthSchemaErrorKeys =
  | "invalidEmail"
  | "passwordMinLength"
  | "nameRequired"
  | "surnameRequired"
  | "tokenRequired"
  | "passwordsMustMatch";

export const loginFormSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(8, { message: "passwordMinLength" }),
});

export const registerFormSchema = loginFormSchema.extend({
  firstName: z.string().nonempty("nameRequired"),
  lastName: z.string().nonempty("surnameRequired"),
});

export const sendPasswordResetTokenSchema = z.object({
  email: z.string().email("invalidEmail"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "tokenRequired"),
    newPassword: z.string().min(8, { message: "passwordMinLength" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsMustMatch",
    path: ["confirmPassword"],
  });
