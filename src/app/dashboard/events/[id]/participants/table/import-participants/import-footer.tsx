import { ArrowRight, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ImportFooterProps {
  canImport: boolean;
  isImporting: boolean;
  blockingIssuesCount: number;
  validationMessages: string[];
  onChooseFile: () => void;
  onSubmit: () => void;
}

export function ImportFooter({
  canImport,
  isImporting,
  blockingIssuesCount,
  validationMessages,
  onChooseFile,
  onSubmit,
}: ImportFooterProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-xl px-4"
          onClick={onChooseFile}
        >
          <Plus className="size-4" />
          Zmień plik
        </Button>
        <Button
          type="button"
          disabled={!canImport}
          className="h-10 w-36 rounded-xl disabled:opacity-50"
          onClick={onSubmit}
        >
          {isImporting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              Importuj
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </div>

      {blockingIssuesCount > 0 ? (
        <div
          role="alert"
          aria-label="Błędy importu CSV"
          className="border-destructive/40 bg-destructive/10 max-h-24 overflow-auto rounded-xl border p-2 text-xs leading-relaxed"
        >
          {validationMessages.slice(0, 5).map((message) => (
            <p key={message}>{message}</p>
          ))}
          {validationMessages.length > 5 ? (
            <p>I {(validationMessages.length - 5).toString()} więcej.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
