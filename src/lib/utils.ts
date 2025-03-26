import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import type { Attribute } from "@/types/attributes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSchemaObjectForAttribute(attribute: Attribute) {
  switch (attribute.type) {
    case "select":
    case "text":
    case "time": {
      return z.string({
        required_error: `Pole ${attribute.name} nie może być puste.`,
      });
    }
    case "multiselect": {
      return z.coerce.string();
    }
    case "email": {
      return z
        .string({
          required_error: `Pole ${attribute.name} nie może być puste.`,
        })
        .email({
          message: `Pole ${attribute.name} musi być adresem email`,
        });
    }
    case "color": {
      return z.string({
        required_error: `Wybierz kolor dla pola ${attribute.name}.`,
      });
    }
    case "textarea": {
      if (attribute.slug === "thoughts") {
        return z.string().optional();
      }
      return z.string({
        required_error: `To pole nie może być puste.`,
      });
    }
    case "number": {
      return z.coerce.number({
        required_error: `Pole ${attribute.name} nie może być puste.`,
        invalid_type_error: `Pole ${attribute.name} musi być liczbą.`,
      });
    }
    case "date":
    case "datetime": {
      return z.coerce.date({
        required_error: `Pole ${attribute.name} nie może być puste.`,
        invalid_type_error: `Pole ${attribute.name} musi być datą.`,
      });
    }
    case "checkbox": {
      return z.boolean({
        required_error: `Pole ${attribute.name} musi być zaznaczone.`,
      });
    }
    case "tel": {
      return z
        .string({
          required_error: `Pole ${attribute.name} nie może być puste.`,
        })
        .regex(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{3})/, {
          message: `Pole ${attribute.name} musi być numerem telefonu.`,
        });
    }
    case "file":
    case "block": {
      return z.unknown();
    }
    default: {
      return z.string({
        required_error: `Pole ${attribute.name} nie może być puste.`,
      });
    }
  }
}

export function getSchemaObjectForAttributes(attributes: Attribute[]) {
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
