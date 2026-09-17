import type { ImportedParticipant } from "@/app/dashboard/events/[uuid]/participants/actions";

export const SKIP_TARGET = "__skip";
export const EMAIL_TARGET = "email";

export type MappingTarget =
  | typeof SKIP_TARGET
  | typeof EMAIL_TARGET
  | `attr:${number}`;

export interface CsvData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export interface ValidationIssue {
  rowIndex: number;
  field: string;
  message: ImportValidationKey;
  values?: Record<string, string | number>;
}

export type ImportValidationKey =
  | "validation.invalidValue"
  | "validation.required"
  | "validation.invalidEmail"
  | "validation.invalidNumber"
  | "validation.invalidDate"
  | "validation.invalidPhone"
  | "validation.requiredChecked"
  | "validation.boolean"
  | "validation.oneOfOptions"
  | "validation.optionNotInList"
  | "validation.tooManyOptions"
  | "validation.blockNotInList"
  | "validation.tooManyBlocks"
  | "validation.blockMustMatch";

export type ImportTranslator = (
  key:
    | ImportValidationKey
    | "validation.missingRequired"
    | "validation.duplicateTarget"
    | "validation.singleIssue"
    | "validation.multipleIssues"
    | "validation.moreRows",
  values?: Record<string, string | number>,
) => string;

export interface PreparedImport {
  participants: ImportedParticipant[];
  issues: ValidationIssue[];
  duplicateTargets: string[];
  missingRequiredTargets: string[];
}
