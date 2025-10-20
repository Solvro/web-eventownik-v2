import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email."),
  password: z
    .string()
    .min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
});

export const registerFormSchema = loginFormSchema.extend({
  firstName: z.string().nonempty("Imię nie może być puste."),
  lastName: z.string().nonempty("Nazwisko nie może być puste."),
});

export const registerParticipantFormSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email."),
  //TODO additional attributes fetched from api
});

export const sendPasswordResetTokenSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token jest wymagany."),
    newPassword: z
      .string()
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła muszą być takie same.",
    path: ["confirmPassword"],
  });
