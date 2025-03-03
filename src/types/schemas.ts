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
