import { FileUp } from "lucide-react";

interface DragOverlayProps {
  hasCsvData: boolean;
}

export function DragOverlay({ hasCsvData }: DragOverlayProps) {
  return (
    <div className="bg-background/90 border-primary/50 text-foreground pointer-events-none absolute inset-2 z-50 grid place-items-center rounded-xl border-2 border-dashed backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
          <FileUp className="size-6" />
        </div>
        <div>
          <p className="font-semibold">Upuść plik CSV tutaj</p>
          <p className="text-muted-foreground text-sm">
            {hasCsvData
              ? "Aktualny plik zostanie zastąpiony."
              : "Plik zostanie wczytany do importu."}
          </p>
        </div>
      </div>
    </div>
  );
}
