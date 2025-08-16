"use client";

import { useAtomValue } from "jotai";
import type { Atom } from "jotai";
import { useNavigationGuard } from "next-navigation-guard";
import { useCallback, useRef } from "react";

/* eslint-disable no-alert */

const ALERT_MESSAGE = "Masz niezapisane zmiany. Czy chcesz kontynuować?";

/**
 * This hook is used to prevent the user from navigating away from the page if there are unsaved changes
 * detected within a form created using `react-hook-form`
 *
 * **IMPORTANT:** Only for usage in single-step forms. For multi-step forms utilizing Jotai, use `useUnsavedAtom` instead.
 *
 * @param isDirty The boolean value accessible in `form.formState.isDirty`
 */
function useUnsavedForm(isDirty: boolean) {
  useNavigationGuard({
    enabled: isDirty,
    confirm: () => window.confirm(ALERT_MESSAGE),
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

  const checkIfDirty = useCallback(() => {
    return (
      // @ts-expect-error: The 'init' property is actually there
      JSON.stringify(currentValue) !== JSON.stringify(initialValue.current.init)
    );
  }, [currentValue, initialValue]);

  const isDirty = checkIfDirty();

  useNavigationGuard({
    enabled: isDirty,
    confirm: () => window.confirm(ALERT_MESSAGE),
  });

  return isDirty;
}

export { useUnsavedAtom, useUnsavedForm };
