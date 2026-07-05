import type { ImportedParticipant } from "@/app/dashboard/events/[id]/participants/actions";

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
  message: string;
}

export interface PreparedImport {
  participants: ImportedParticipant[];
  issues: ValidationIssue[];
  duplicateTargets: string[];
  missingRequiredTargets: string[];
}
