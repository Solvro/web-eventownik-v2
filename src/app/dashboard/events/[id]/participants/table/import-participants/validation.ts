import { getAttributeLabel, getSchemaObjectForAttribute } from "@/lib/utils";
import type { Attribute, AttributeOption } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { getAttributeTarget } from "./mapping";
import { EMAIL_TARGET, SKIP_TARGET } from "./types";
import type {
  CsvData,
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
    return "Pomiń";
  }

  const attributeId = Number(target.replace("attr:", ""));
  const attribute = attributes.find((item) => item.id === attributeId);
  return attribute == null ? target : getAttributeLabel(attribute.name, locale);
}

function getSharedValidationError(
  value: unknown,
  attribute: Attribute,
  locale: string,
) {
  const result = getSchemaObjectForAttribute(attribute).safeParse(value);
  if (result.success) {
    return null;
  }

  const fallbackMessage = "ma nieprawidłową wartość";
  const message = result.error.issues[0]?.message ?? fallbackMessage;
  const label = getAttributeLabel(attribute.name, locale);

  return message
    .replace(`Pole ${label} `, "")
    .replace(`dla pola ${label}`, "")
    .replace(/\.$/, "");
}

function validateAttributeValue(
  value: string,
  attribute: Attribute,
  blocks: Block[],
  locale: string,
): { value: string | null } | { error: string } {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { value: null };
  }

  switch (attribute.type) {
    case "number": {
      const normalizedNumber = trimmed.replace(",", ".");
      const sharedError = getSharedValidationError(
        normalizedNumber,
        attribute,
        locale,
      );
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: Number(normalizedNumber).toString() };
    }
    case "email": {
      const sharedError = getSharedValidationError(trimmed, attribute, locale);
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
          return { error: "musi być zaznaczone" };
        }
        return { value: "false" };
      }
      return { error: "musi być wartością tak/nie" };
    }
    case "select": {
      const options = attribute.options ?? [];
      const option = findMatchingOption(trimmed, options);
      if (option == null) {
        return {
          error: `musi być jedną z opcji: ${getOptionSummary(options)}`,
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
          error: `zawiera opcję spoza listy: ${getOptionSummary(options)}`,
        };
      }
      if (
        attribute.maxSelections != null &&
        matchedValues.length > attribute.maxSelections
      ) {
        return {
          error: `ma za dużo opcji, maksymalnie ${attribute.maxSelections.toString()}`,
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
      const sharedError = getSharedValidationError(trimmed, attribute, locale);
      if (sharedError != null) {
        return { error: sharedError };
      }
      return { value: trimmed };
    }
    case "color": {
      const sharedError = getSharedValidationError(trimmed, attribute, locale);
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
          return { error: "zawiera blok spoza listy" };
        }
        if (
          attribute.maxSelections != null &&
          matchedBlocks.length > attribute.maxSelections
        ) {
          return {
            error: `ma za dużo bloków, maksymalnie ${attribute.maxSelections.toString()}`,
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
        return { error: "musi pasować do nazwy lub ID bloku" };
      }
      return { value: matchingBlock.id.toString() };
    }
    case "text":
    case "textarea":
    case "time":
    case "tel": {
      const sharedError = getSharedValidationError(trimmed, attribute, locale);
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
        message: "nieprawidłowy adres email",
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
          message: "jest wymagane",
        });
        continue;
      }

      const result = validateAttributeValue(
        rawValue,
        attribute,
        blocks,
        locale,
      );
      if ("error" in result) {
        issues.push({
          rowIndex,
          field: getAttributeLabel(attribute.name, locale),
          message: result.error,
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
