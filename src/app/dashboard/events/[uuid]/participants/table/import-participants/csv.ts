import type { CsvData } from "./types";

const CSV_DELIMITERS = [",", ";", "\t"];

function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === delimiter && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(current.trim());
      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += character;
  }

  row.push(current.trim());
  if (row.some((cell) => cell !== "")) {
    rows.push(row);
  }

  return rows;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim() !== "");
  if (firstLine == null) {
    return ",";
  }

  return (
    CSV_DELIMITERS.toSorted(
      (a, b) =>
        parseCsvLine(firstLine, b).length - parseCsvLine(firstLine, a).length,
    )[0] ?? ","
  );
}

export function parseCsv(text: string, fileName: string): CsvData {
  const normalizedText = text.replace(/^\uFEFF/, "");

  if (normalizedText.trim() === "") {
    return { headers: [], rows: [], fileName };
  }

  const delimiter = detectDelimiter(normalizedText);
  const records = parseCsvRows(normalizedText, delimiter);
  const headers = records[0] ?? [];
  const rows = records.slice(1);

  return { headers, rows, fileName };
}
