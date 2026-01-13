import { useDebouncedCallback } from "@tanstack/react-pacer";
import { Eraser, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type {
  ControllerRenderProps,
  FieldValues,
  UseFormResetField,
  UseFormSetError,
} from "react-hook-form";
import { ReactSketchCanvas } from "react-sketch-canvas";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { FormAttribute } from "@/types/attributes";

export function AttributeInputDrawing({
  field,
  attribute,
  setError,
  resetField,
  setFiles,
  lastUpdate,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  attribute: FormAttribute;
  setError: UseFormSetError<FieldValues>;
  resetField: UseFormResetField<FieldValues>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  lastUpdate: string | null;
}) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);

  const debouncedExport = useDebouncedCallback(
    async () => {
      if (canvasRef.current == null) {
        return;
      }

      try {
        const paths = await canvasRef.current.exportPaths();
        const isEmpty = paths.length === 0;

        if (isEmpty) {
          setFiles((previousFiles) =>
            previousFiles.filter(
              (file) => file.name !== attribute.id.toString(),
            ),
          );
          return;
        }

        const dataUrl = await canvasRef.current.exportImage("png");
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], attribute.id.toString(), {
          type: "image/png",
        });

        setFiles((previousFiles) => {
          const filtered = previousFiles.filter(
            (existingFile) => existingFile.name !== file.name,
          );
          return [...filtered, file];
        });

        resetField(attribute.id.toString());
      } catch (error) {
        console.error("Failed to export drawing:", error);
        setError(attribute.id.toString(), {
          message: "Nie udało się zapisać rysunku",
        });
      }
    },
    { wait: 250 },
  );

  function handleCanvasChange() {
    debouncedExport();
  }

  function handleClear() {
    canvasRef.current?.clearCanvas();
    debouncedExport();
  }

  function handleUndo() {
    canvasRef.current?.undo();
    debouncedExport();
  }

  function handleEraserClick() {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  }

  function handlePenClick() {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  }

  return (
    <div className="space-y-2">
      {lastUpdate != null && (
        <div>
          <span className="text-muted-foreground text-sm">
            Ostatnio zapisany rysunek: {new Date(lastUpdate).toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant={eraseMode ? "outline" : "eventDefault"}
            size="icon"
            onClick={handlePenClick}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant={eraseMode ? "eventDefault" : "outline"}
            size="icon"
            onClick={handleEraserClick}
          >
            <Eraser />
          </Button>

          <Button
            variant="outline"
            type="button"
            size="icon"
            className="cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: strokeColor }}
            asChild
          >
            <label htmlFor={`stroke-color-${attribute.id.toString()}`}>
              <input
                type="color"
                id={`stroke-color-${attribute.id.toString()}`}
                value={strokeColor}
                onChange={(event_) => {
                  setStrokeColor(event_.target.value);
                }}
                className="pointer-events-none h-0 w-0 p-4 opacity-0"
                aria-label="Wybór koloru"
              />
            </label>
          </Button>
        </div>

        <Slider
          value={[strokeWidth]}
          onValueChange={(value: number[]) => {
            setStrokeWidth(value[0]);
          }}
          min={1}
          max={20}
          step={1}
          variant="eventDefault"
        />
      </div>

      <div className="border-input overflow-hidden rounded-xl bg-white shadow-xs">
        <ReactSketchCanvas
          ref={canvasRef}
          width="100%"
          className="aspect-video"
          strokeWidth={strokeWidth}
          eraserWidth={strokeWidth}
          strokeColor={strokeColor}
          canvasColor="#ffffff"
          style={{
            border: "0",
          }}
          onChange={handleCanvasChange}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          className="flex-1"
        >
          <RotateCcw />
          Cofnij
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex-1"
        >
          <Trash2 />
          Wyczyść
        </Button>
      </div>
      <input type="hidden" id={attribute.id.toString()} {...field} />
    </div>
  );
}
