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

const POLISH_TO_ASCII: Record<string, string> = {
  ą: "a",
  ę: "e",
  ó: "o",
  ś: "s",
  ć: "c",
  ź: "z",
  ż: "z",
  ł: "l",
  ń: "n",
};

/** Converts a name to a slug compatible with SLUG_REGEX (a-z, 0-9, hyphens). */
export function nameToSlug(name: string): string {
  const withAscii = name.replaceAll(
    /[ąćęłńóśźż]/gi,
    (char) => POLISH_TO_ASCII[char.toLowerCase()] ?? char,
  );
  return withAscii
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export type FormValidationErrors =
  | "fieldRequired"
  | "fieldMinSelect"
  | "fieldEmail"
  | "fieldColorRequired"
  | "fieldNumber"
  | "fieldDate"
  | "fieldRequiredChecked"
  | "fieldPhone";

// Helper function for string validation
const requiredString = z
  .string({
    required_error: "fieldRequired",
  })
  .min(1, {
    message: "fieldRequired",
  });

const validationRules: Record<FormAttribute["type"], z.ZodType> = {
  select: requiredString,
  text: requiredString,
  time: requiredString,
  multiselect: z
    .array(z.string(), {
      required_error: "fieldMinSelect",
    })
    .nonempty({
      message: "fieldMinSelect",
    }),
  email: requiredString.email({
    message: "fieldEmail",
  }),
  color: z.string({
    required_error: "fieldColorRequired",
  }),
  textarea: requiredString,
  number: z.coerce.number({
    required_error: "fieldRequired",
    invalid_type_error: "fieldNumber",
  }),
  date: z.coerce.date({
    required_error: "fieldRequired",
    invalid_type_error: "fieldDate",
  }),
  datetime: z.coerce.date({
    required_error: "fieldRequired",
    invalid_type_error: "fieldDate",
  }),
  checkbox: z.literal<boolean>(true, {
    errorMap: () => ({
      message: "fieldRequiredChecked",
    }),
  }),
  tel: requiredString.regex(PHONE_REGEX, {
    message: "fieldPhone",
  }),
  // TODO: After upgrade to zod v4 we could use z.file() and simplify the validation and file handling
  // https://zod.dev/api?id=files
  file: z.any(),
  drawing: z.any(),
  block: z.any(),
};

export function getSchemaObjectForAttribute(attribute: FormAttribute) {
  const baseRule = validationRules[attribute.type];
  return attribute.isRequired ? baseRule : baseRule.optional();
}

export function getSchemaObjectForAttributes(attributes: FormAttribute[]) {
  return Object.fromEntries(
    attributes.map((attribute) => [
      attribute.uuid,
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

export function getAttributeLabel(name: string, language: string) {
  try {
    const parsed = JSON.parse(name) as Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return parsed[language] ?? parsed.pl ?? Object.values(parsed)[0] ?? name;
  } catch {
    return name;
  }
}
