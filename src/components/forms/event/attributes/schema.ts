import { z } from "zod";

import type { Attribute } from "@/types/attributes";

export type EventAttributesFormErrors =
  | "attributeNameRequired"
  | "attributeNameExists"
  | "sensitiveDataReasonRequired";

export const EventAttributesFormSchema = z.object({
  attributes: z
    .array(z.custom<Attribute>())
    .transform((attributes) => {
      if (attributes.length === 1 && !attributes[0].name) {
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
            message: "attributeNameRequired",
          });
        }
        const normalizedName = attribute.name.toLowerCase().trim();
        if (normalizedName && nameSet.has(normalizedName)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "name"],
            message: "attributeNameExists",
          });
        }
        nameSet.add(normalizedName);

        if (
          attribute.config.isSensitiveData &&
          (attribute.config.reason == null ||
            attribute.config.reason.trim() === "")
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "reason"],
            message: "sensitiveDataReasonRequired",
          });
        }
      }
    }),
});
