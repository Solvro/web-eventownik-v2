import { getAttributeLabel, getSchemaObjectForAttribute } from "@/lib/utils";
import type { Attribute, AttributeOption } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { getAttributeTarget } from "./mapping";
import { EMAIL_TARGET, SKIP_TARGET } from "./types";
import type {
  CsvData,
  ImportValidationKey,
  MappingTarget,
  PreparedImport,
  ValidationIssue,
} from "./types";

const MULTI_VALUE_SEPARATOR = /[;|,]/;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function resolveAttributeOption(option: AttributeOption) {
  if (typeof option === "string") {
    return { label: option, value: option };
  }

  return option;
}

function getOptionSummary(options: AttributeOption[]) {
  return options
    .map((option) => resolveAttributeOption(option).label)
    .join(", ");
}

function findMatchingOption(value: string, options: AttributeOption[]) {
  return options.find((option) => {
    const resolved = resolveAttributeOption(option);
    return (
      normalize(resolved.value) === normalize(value) ||
      normalize(resolved.label) === normalize(value)
    );
  });
}

function findMatchingBlock(
  value: string,
  attribute: Attribute,
  selectableBlocks: Block[],
) {
  const trimmed = value.trim();

  return selectableBlocks.find(
    (block) =>
      block.attributeId === attribute.id &&
      (block.id.toString() === trimmed ||
        normalize(block.name) === normalize(trimmed)),
  );
}

function getTargetLabel(
  target: MappingTarget,
  attributes: Attribute[],
  locale: string,
) {
  if (target === EMAIL_TARGET) {
    return "Email";
  }
  if (target === SKIP_TARGET) {
    return target;
  }

  const attributeId = Number(target.replace("attr:", ""));
  const attribute = attributes.find((item) => item.id === attributeId);
  return attribute == null ? target : getAttributeLabel(attribute.name, locale);
}

function getSharedValidationError(
  value: unknown,
  attribute: Attribute,
): ImportValidationKey | null {
  const result = getSchemaObjectForAttribute(attribute).safeParse(value);
  if (result.success) {
    return null;
  }

  switch (result.error.issues[0]?.message) {
    case "fieldEmail": {
      return "validation.invalidEmail";
    }
    case "fieldNumber": {
      return "validation.invalidNumber";
    }
    case "fieldDate": {
      return "validation.invalidDate";
    }
    case "fieldPhone": {
      return "validation.invalidPhone";
    }
    case "fieldRequiredChecked": {
      return "validation.requiredChecked";
    }
    default: {
      return "validation.invalidValue";
    }
  }
}

function validateAttributeValue(
  value: string,
  attribute: Attribute,
  blocks: Block[],
):
  | { value: string | null }
  | {
      error: ImportValidationKey;
      values?: Record<string, string | number>;
    } {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { value: null };
  }

  switch (attribute.type) {
    case "number": {
      const normalizedNumber = trimmed.replace(",", ".");
      const sharedError = getSharedValidationError(normalizedNumber, attribute);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: Number(normalizedNumber).toString() };
    }
    case "email": {
      const sharedError = getSharedValidationError(trimmed, attribute);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: trimmed };
    }
    case "checkbox": {
      const truthy = ["true", "1", "yes", "tak", "t", "y"];
      const falsy = ["false", "0", "no", "nie", "n"];
      const normalized = normalize(trimmed);
      if (truthy.includes(normalized)) {
        return { value: "true" };
      }
      if (falsy.includes(normalized)) {
        if (attribute.isRequired) {
          return { error: "validation.requiredChecked" };
        }
        return { value: "false" };
      }
      return { error: "validation.boolean" };
    }
    case "select": {
      const options = attribute.options ?? [];
      const option = findMatchingOption(trimmed, options);
      if (option == null) {
        return {
          error: "validation.oneOfOptions",
          values: { options: getOptionSummary(options) },
        };
      }
      return { value: resolveAttributeOption(option).value };
    }
    case "multiselect": {
      const options = attribute.options ?? [];
      const values = trimmed
        .split(MULTI_VALUE_SEPARATOR)
        .map((item) => item.trim())
        .filter(Boolean);
      const matchedValues = values.map((item) =>
        findMatchingOption(item, options),
      );
      if (matchedValues.some((item) => item == null)) {
        return {
          error: "validation.optionNotInList",
          values: { options: getOptionSummary(options) },
        };
      }
      if (
        attribute.maxSelections != null &&
        matchedValues.length > attribute.maxSelections
      ) {
        return {
          error: "validation.tooManyOptions",
          values: { max: attribute.maxSelections },
        };
      }
      return {
        value: matchedValues
          .filter((item) => item != null)
          .map((item) => resolveAttributeOption(item).value)
          .join(","),
      };
    }
    case "date":
    case "datetime": {
      const sharedError = getSharedValidationError(trimmed, attribute);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: trimmed };
    }
    case "color": {
      const sharedError = getSharedValidationError(trimmed, attribute);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: trimmed };
    }
    case "block": {
      if (attribute.isMultiple) {
        const values = trimmed
          .split(MULTI_VALUE_SEPARATOR)
          .map((item) => item.trim())
          .filter(Boolean);
        const matchedBlocks = values.map((item) =>
          findMatchingBlock(item, attribute, blocks),
        );

        if (matchedBlocks.some((item) => item == null)) {
          return { error: "validation.blockNotInList" };
        }
        if (
          attribute.maxSelections != null &&
          matchedBlocks.length > attribute.maxSelections
        ) {
          return {
            error: "validation.tooManyBlocks",
            values: { max: attribute.maxSelections },
          };
        }

        return {
          value: matchedBlocks
            .filter((item) => item != null)
            .map((item) => item.id.toString())
            .join(","),
        };
      }

      const matchingBlock = findMatchingBlock(trimmed, attribute, blocks);
      if (matchingBlock == null) {
        return { error: "validation.blockMustMatch" };
      }
      return { value: matchingBlock.id.toString() };
    }
    case "text":
    case "textarea":
    case "time":
    case "tel": {
      const sharedError = getSharedValidationError(trimmed, attribute);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: trimmed };
    }
    case "file":
    case "drawing": {
      return { value: trimmed };
    }
  }
}

export function prepareImport({
  csvData,
  mappings,
  attributes,
  blocks,
  locale,
}: {
  csvData: CsvData | null;
  mappings: Record<number, MappingTarget>;
  attributes: Attribute[];
  blocks: Block[];
  locale: string;
}): PreparedImport {
  if (csvData == null) {
    return {
      participants: [],
      issues: [],
      duplicateTargets: [],
      missingRequiredTargets: [],
    };
  }

  const selectedTargets = Object.values(mappings).filter(
    (target): target is Exclude<MappingTarget, typeof SKIP_TARGET> =>
      target !== SKIP_TARGET,
  );
  const duplicateTargets = selectedTargets.filter(
    (target, index) => selectedTargets.indexOf(target) !== index,
  );
  const mappedTargets = new Set(selectedTargets);
  const requiredTargets: Exclude<MappingTarget, typeof SKIP_TARGET>[] = [
    EMAIL_TARGET,
    ...attributes
      .filter((attribute) => attribute.isRequired)
      .map((attribute) => getAttributeTarget(attribute.id)),
  ];
  const missingRequiredTargets = requiredTargets
    .filter((target) => !mappedTargets.has(target))
    .map((target) => getTargetLabel(target, attributes, locale));

  const issues: ValidationIssue[] = [];
  const participants: PreparedImport["participants"] = [];
  const emailColumnIndex = Object.entries(mappings).find(
    ([, target]) => target === EMAIL_TARGET,
  )?.[0];

  for (const [rowIndex, row] of csvData.rows.entries()) {
    const email =
      emailColumnIndex == null ? "" : (row[Number(emailColumnIndex)] ?? "");
    if (
      emailColumnIndex != null &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      issues.push({
        rowIndex,
        field: "Email",
        message: "validation.invalidEmail",
      });
    }

    const participantAttributes: PreparedImport["participants"][number]["participantAttributes"] =
      [];

    for (const [columnIndex, target] of Object.entries(mappings)) {
      if (target === SKIP_TARGET || target === EMAIL_TARGET) {
        continue;
      }

      const attributeId = Number(target.replace("attr:", ""));
      const attribute = attributes.find((item) => item.id === attributeId);
      if (attribute == null) {
        continue;
      }

      const rawValue = row[Number(columnIndex)] ?? "";
      if (attribute.isRequired && rawValue.trim() === "") {
        issues.push({
          rowIndex,
          field: getAttributeLabel(attribute.name, locale),
          message: "validation.required",
        });
        continue;
      }

      const result = validateAttributeValue(rawValue, attribute, blocks);
      if ("error" in result) {
        issues.push({
          rowIndex,
          field: getAttributeLabel(attribute.name, locale),
          message: result.error,
          values: result.values,
        });
        continue;
      }

      if (result.value !== null) {
        participantAttributes.push({
          attributeId,
          value: result.value,
        });
      }
    }

    participants.push({
      email: email.trim(),
      participantAttributes,
    });
  }

  return {
    participants,
    issues,
    duplicateTargets: [...new Set(duplicateTargets)].map((target) =>
      getTargetLabel(target, attributes, locale),
    ),
    missingRequiredTargets,
  };
}
