import { useCallback, useEffect } from "react";
import type { SetStateAction } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * This hook is used within standard step forms in multi-step forms to automatically save each form change to the atom state.
 * It detects each change in any of the inputs and saves it to the atom state.
 *
 * **IMPORTANT**: Should not be used in steps which implement non-standard forms that need to modify the atom state directly.
 *
 * See [coorganizers.tsx](../app/dashboard/(create-event)/(steps)/coorganizers.tsx) for an example where *not* to use it
 *
 * @param setAtom The atom state setter
 * @param form The form instance created with `useForm` from `react-hook-form`
 */
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
