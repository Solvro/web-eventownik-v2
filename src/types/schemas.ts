import { z } from "zod";

export type AuthSchemaErrorKeys =
  | "invalidEmail"
  | "passwordMinLength"
  | "nameRequired"
  | "surnameRequired"
  | "tokenRequired"
  | "passwordsMustMatch"
  | "confirmPassword";

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

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  content: z.string().min(1, "Zawartość HTML jest wymagana"),
  schema: z.string().min(1, "Struktura edytora jest wymagana"),
  trigger: z.string().min(1, "Wyzwalacz jest wymagany"),
  triggerValue: z.string().nullable().default(null),
  triggerValue2: z.string().nullable().optional(),
});
