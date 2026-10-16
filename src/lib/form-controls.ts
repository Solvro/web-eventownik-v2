import type { FormControlAttribute } from "@/types/attributes";
import type { V3Form, V3PublicParticipant } from "@/types/v3";

/** Bind definitions and attribute configuration to participant form controls. */
export function formControls(form: V3Form): FormControlAttribute[] {
  return form.formDefinitions.flatMap((definition) => {
    const attribute = definition.attribute;
    if (attribute === null) {
      return [];
    }
    const config = attribute.config ?? {};
    const options = config.options;
    const maxSelections =
      typeof config.maxSelections === "number" ? config.maxSelections : null;
    return [
      {
        uuid: attribute.uuid,
        name: attribute.name,
        type: attribute.type,
        order: definition.order,
        isRequired: definition.isRequired,
        isEditable: form.isEditable,
        options: Array.isArray(options)
          ? options.filter(
              (option): option is string => typeof option === "string",
            )
          : [],
        isMultiple:
          attribute.type === "block" &&
          maxSelections !== null &&
          maxSelections > 1,
        maxSelections,
      },
    ];
  });
}

export function participantFormValues(
  controls: FormControlAttribute[],
  participant?: V3PublicParticipant,
): Record<string, unknown> {
  return Object.fromEntries(
    controls
      .filter((field) => field.type !== "file" && field.type !== "drawing")
      .map((field) => {
        const value = participant?.attributes.find(
          (entry) => entry.attributeUuid === field.uuid,
        )?.value;
        if (field.type === "block" && !field.isMultiple) {
          return [
            field.uuid,
            Array.isArray(value) ? (value[0] ?? "null") : (value ?? "null"),
          ];
        }
        if (field.type === "multiSelect" || field.isMultiple) {
          return [field.uuid, value ?? []];
        }
        if (field.type === "checkbox") {
          return [field.uuid, value ?? false];
        }
        return [field.uuid, value ?? ""];
      }),
  );
}
