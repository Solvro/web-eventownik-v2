import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import type { CsvData } from "./types";

interface CsvPreviewProps {
  csvData: CsvData;
}

function getSpreadsheetColumnLabel(columnIndex: number) {
  let remainingIndex = columnIndex;
  let label = "";

  do {
    label = String.fromCodePoint(65 + (remainingIndex % 26)) + label;
    remainingIndex = Math.floor(remainingIndex / 26) - 1;
  } while (remainingIndex >= 0);

  return label;
}

export function CsvPreview({ csvData }: CsvPreviewProps) {
  const sheetHeaders = csvData.headers;
  const sheetRows = Array.from({ length: 14 }, (_, index) => {
    return csvData.rows[index] ?? [];
  });
  const gridTemplateColumns = `2.5rem repeat(${sheetHeaders.length.toString()}, minmax(4.75rem, 1fr))`;

  return (
    <section
      aria-label="Podgląd pliku CSV"
      className="border-border bg-muted/20 min-h-0 border-b p-3 select-none md:border-r md:border-b-0"
    >
      <ScrollArea className="h-full">
        <div className="min-w-[34rem]">
          <div
            className="border-border bg-background grid overflow-hidden rounded-lg border-t border-l text-[0.7rem]"
            style={{ gridTemplateColumns }}
          >
            <div className="border-border bg-muted/60 border-r border-b px-2 py-1" />
            {sheetHeaders.map((header, index) => (
              <div
                key={`${header}-${index.toString()}`}
                className="border-border bg-muted/60 text-muted-foreground border-r border-b px-2 py-1 text-center font-medium"
              >
                {getSpreadsheetColumnLabel(index)}
              </div>
            ))}
            <div className="border-border bg-muted/60 text-muted-foreground border-r border-b px-2 py-1 text-right">
              1
            </div>
            {sheetHeaders.map((header, index) => (
              <div
                key={`${header}-${index.toString()}`}
                className="border-border bg-primary/20 text-foreground border-r border-b px-2 py-1 font-semibold"
              >
                {header}
              </div>
            ))}
            {sheetRows.map((row, rowIndex) => (
              <div
                key={`sheet-row-${rowIndex.toString()}`}
                className="contents"
              >
                <div className="border-border bg-muted/60 text-muted-foreground h-6 border-r border-b px-2 py-1 text-right">
                  {(rowIndex + 2).toString()}
                </div>
                {sheetHeaders.map((header, columnIndex) => (
                  <div
                    key={`${rowIndex.toString()}-${header}-${columnIndex.toString()}`}
                    className="border-border h-6 truncate border-r border-b px-2 py-1"
                    title={row[columnIndex] ?? ""}
                  >
                    {row[columnIndex] ?? ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
