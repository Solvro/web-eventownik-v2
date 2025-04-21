import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import type { FormAttribute } from "@/types/attributes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PHONE_REGEX = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{3})/;

export const SLUG_REGEX = /^[a-z0-9-]+$/;

// Helper function for string validation
const requiredString = (attribute: FormAttribute) =>
  z
    .string({
      required_error: `Pole ${attribute.name} nie może być puste.`,
    })
    .min(1, {
      message: `Pole ${attribute.name} nie może być puste.`,
    });

const validationRules: Record<
  FormAttribute["type"],
  (attribute: FormAttribute) => z.ZodType
> = {
  select: requiredString,
  text: requiredString,
  time: requiredString,
  multiselect: (attribute) =>
    z
      .array(z.string(), {
        required_error: `Wybierz przynajmniej jedną opcję dla pola ${attribute.name}.`,
      })
      .nonempty({
        message: `Wybierz przynajmniej jedną opcję dla pola ${attribute.name}.`,
      }),
  email: (attribute) =>
    requiredString(attribute).email({
      message: `Pole ${attribute.name} musi być adresem email`,
    }),
  color: (attribute) =>
    z.string({ required_error: `Wybierz kolor dla pola ${attribute.name}.` }),
  textarea: requiredString,
  number: (attribute) =>
    z.coerce.number({
      required_error: `Pole ${attribute.name} nie może być puste.`,
      invalid_type_error: `Pole ${attribute.name} musi być liczbą.`,
    }),
  date: (attribute) =>
    z.coerce.date({
      required_error: `Pole ${attribute.name} nie może być puste.`,
      invalid_type_error: `Pole ${attribute.name} musi być datą.`,
    }),
  datetime: (attribute) =>
    z.coerce.date({
      required_error: `Pole ${attribute.name} nie może być puste.`,
      invalid_type_error: `Pole ${attribute.name} musi być datą.`,
    }),
  checkbox: (attribute) =>
    z.literal<boolean>(true, {
      errorMap: () => ({
        message: `Pole ${attribute.name} musi być zaznaczone.`,
      }),
    }),
  tel: (attribute) =>
    requiredString(attribute).regex(PHONE_REGEX, {
      message: `Pole ${attribute.name} musi być numerem telefonu.`,
    }),
  file: () => z.any(),
  block: () => z.any(),
};

export function getSchemaObjectForAttribute(attribute: FormAttribute) {
  const baseRule = validationRules[attribute.type](attribute);
  return attribute.isRequired ? baseRule : baseRule.optional();
}

export function getSchemaObjectForAttributes(attributes: FormAttribute[]) {
  return Object.fromEntries(
    attributes.map((attribute) => [
      attribute.id.toString(),
      getSchemaObjectForAttribute(attribute),
    ]),
  );
}

export async function getBase64FromUrl(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(
      `[getBase64FromUrl] Failed to get base64 from url ${url}:`,
      error,
    );
    return "";
  }
}

export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
