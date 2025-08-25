import { useCallback, useEffect } from "react";
import type { SetStateAction } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

function useAutoSave<T, U extends FieldValues>(
  setAtom: (update: SetStateAction<T>) => void,
  form: UseFormReturn<U>,
) {
  const saveEdits = useCallback(() => {
    setAtom((previous: T) => {
      return { ...previous, ...form.getValues() };
    });
  }, [form, setAtom]);

  const unsubscribe = form.subscribe({
    formState: { values: true },
    callback: saveEdits,
  });

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);
}

export { useAutoSave };
