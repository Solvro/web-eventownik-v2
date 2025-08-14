import { useAtomValue } from "jotai";
import type { Atom } from "jotai";
import { useEffect, useRef } from "react";

const launchAlert = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  event.returnValue = "";
};

/**
 * This hook is used to prevent the user from navigating away from the page if there are unsaved changes
 * detected within a form created using `react-hook-form`
 *
 * **IMPORTANT:** Only for usage in single-step forms. For multi-step forms utilizing Jotai, use `useUnsavedAtom` instead.
 *
 * @param isDirty The boolean value accessible in `form.formState.isDirty`
 */
function useUnsavedForm(isDirty: boolean) {
  useEffect(() => {
    if (isDirty) {
      window.addEventListener("beforeunload", launchAlert);
    }

    return () => {
      window.removeEventListener("beforeunload", launchAlert);
    };
  });

  return null;
}

/**
 * This hook is used to prevent the user from navigating away from the page if there are unsaved changes
 * detected within the atom. Use the hook within the root form component wrapping each step.
 *
 * **IMPORTANT:** Only for usage in multi-step forms. For single-step forms, use `useUnsavedForm` instead.
 *
 * @param atom The Jotai atom instance from within `src/app/atoms`
 */
function useUnsavedAtom(atom: Atom<unknown>) {
  const initialValue = useRef({ ...atom });
  const currentValue = useAtomValue(atom);

  const checkIfDirty = () => {
    return (
      // @ts-expect-error: The 'init' property is actually there
      JSON.stringify(currentValue) !== JSON.stringify(initialValue.current.init)
    );
  };

  useEffect(() => {
    const isDirty = checkIfDirty();
    if (isDirty) {
      window.addEventListener("beforeunload", launchAlert);
    }

    return () => {
      window.removeEventListener("beforeunload", launchAlert);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return null;
}

export { useUnsavedAtom, useUnsavedForm };
