import { clsx } from "clsx";
import type { ClassValue } from "clsx";
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
      if (attribute.slug === "section") {
        return z.coerce.string();
      }
      return z.string({
        required_error: `Pole ${attribute.name} nie może być puste.`,
      });
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
