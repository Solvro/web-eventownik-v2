import { z } from "zod";

import type { NewEventAttribute } from "./types";

export const EventAttributesFormSchema = z.object({
  attributes: z
    .array(z.custom<NewEventAttribute>())
    .transform((attributes) => {
      if (
        attributes.length === 1 &&
        !attributes[0].name &&
        attributes[0].slug === ""
      ) {
        return [];
      }
      return attributes;
    })
    .superRefine((attributes, context) => {
      const nameSet = new Set<string>();
      for (const [index, attribute] of attributes.entries()) {
        if (attribute.name === "") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "name"],
            message: "Nazwa atrybutu nie może być pusta.",
          });
        }
        const normalizedName = attribute.name.toLowerCase().trim();
        if (normalizedName && nameSet.has(normalizedName)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "name"],
            message: "Atrybut o tej nazwie już istnieje.",
          });
        }
        nameSet.add(normalizedName);

        if (
          attribute.isSensitiveData &&
          (attribute.reason == null || attribute.reason.trim() === "")
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "reason"],
            message: "Powód jest wymagany dla danych wrażliwych.",
          });
        }
      }
    }),
});
