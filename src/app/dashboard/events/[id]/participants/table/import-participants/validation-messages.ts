import type { PreparedImport } from "./types";

function getRowWord(count: number) {
  if (count === 1) {
    return "wiersz";
  }

  if (count >= 2 && count <= 4) {
    return "wiersze";
  }

  return "wierszy";
}

export function getValidationMessages(preparedImport: PreparedImport) {
  const messages: string[] = [];

  for (const target of preparedImport.missingRequiredTargets) {
    messages.push(`Przypisz kolumnę do wymaganego pola: ${target}.`);
  }

  if (preparedImport.duplicateTargets.length > 0) {
    messages.push(
      `To samo pole przypisano więcej niż raz: ${preparedImport.duplicateTargets.join(", ")}.`,
    );
  }

  const groupedIssues = new Map<
    string,
    { field: string; message: string; rowIndexes: number[] }
  >();

  for (const issue of preparedImport.issues) {
    const key = `${issue.field}:${issue.message}`;
    const group = groupedIssues.get(key);

    if (group == null) {
      groupedIssues.set(key, {
        field: issue.field,
        message: issue.message,
        rowIndexes: [issue.rowIndex],
      });
      continue;
    }

    group.rowIndexes.push(issue.rowIndex);
  }

  for (const group of groupedIssues.values()) {
    const rowNumbers = group.rowIndexes.map((rowIndex) => rowIndex + 2);
    if (rowNumbers.length === 1) {
      messages.push(
        `Wiersz ${rowNumbers[0]?.toString() ?? ""}, ${group.field}: ${group.message}.`,
      );
      continue;
    }

    const visibleRows = rowNumbers
      .slice(0, 4)
      .map((rowNumber) => rowNumber.toString())
      .join(", ");
    const hiddenRowsCount = rowNumbers.length - 4;
    const rowsSuffix =
      hiddenRowsCount > 0 ? ` i ${hiddenRowsCount.toString()} więcej` : "";

    messages.push(
      `${group.field}: ${rowNumbers.length.toString()} ${getRowWord(rowNumbers.length)} - ${group.message} (wiersze ${visibleRows}${rowsSuffix}).`,
    );
  }

  return messages;
}
