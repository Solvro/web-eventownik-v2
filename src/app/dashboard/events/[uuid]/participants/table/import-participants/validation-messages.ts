import type {
  ImportTranslator,
  ImportValidationKey,
  PreparedImport,
} from "./types";

export function getValidationMessages(
  preparedImport: PreparedImport,
  t: ImportTranslator,
) {
  const messages: string[] = [];

  for (const target of preparedImport.missingRequiredTargets) {
    messages.push(t("validation.missingRequired", { target }));
  }

  if (preparedImport.duplicateTargets.length > 0) {
    messages.push(
      t("validation.duplicateTarget", {
        targets: preparedImport.duplicateTargets.join(", "),
      }),
    );
  }

  const groupedIssues = new Map<
    string,
    {
      field: string;
      message: ImportValidationKey;
      values?: Record<string, string | number>;
      rowIndexes: number[];
    }
  >();

  for (const issue of preparedImport.issues) {
    const key = `${issue.field}:${issue.message}`;
    const group = groupedIssues.get(key);

    if (group == null) {
      groupedIssues.set(key, {
        field: issue.field,
        message: issue.message,
        values: issue.values,
        rowIndexes: [issue.rowIndex],
      });
      continue;
    }

    group.rowIndexes.push(issue.rowIndex);
  }

  for (const group of groupedIssues.values()) {
    const rowNumbers = group.rowIndexes.map((rowIndex) => rowIndex + 2);
    const translatedMessage = t(group.message, group.values);
    if (rowNumbers.length === 1) {
      messages.push(
        t("validation.singleIssue", {
          row: rowNumbers[0]?.toString() ?? "",
          field: group.field,
          message: translatedMessage,
        }),
      );
      continue;
    }

    const visibleRows = rowNumbers
      .slice(0, 4)
      .map((rowNumber) => rowNumber.toString())
      .join(", ");
    const hiddenRowsCount = rowNumbers.length - 4;
    const rowsSuffix =
      hiddenRowsCount > 0
        ? t("validation.moreRows", { count: hiddenRowsCount })
        : "";

    messages.push(
      t("validation.multipleIssues", {
        field: group.field,
        count: rowNumbers.length,
        message: translatedMessage,
        rows: visibleRows,
        more: rowsSuffix,
      }),
    );
  }

  return messages;
}
