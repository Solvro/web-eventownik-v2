"use client";

import { useAtomValue, useSetAtom } from "jotai";
import type { PrimitiveAtom } from "jotai";
import { useNavigationGuard } from "next-navigation-guard";
import { useCallback, useRef, useState } from "react";

// NOTE: Jotai's source code says that this is an internal type and shouldn't be referenced
// as it is subject to change without notice. However, defining it here allows to not use
// any eslint-disable or ts-ignore directives
interface WithInitialValue<T> {
  init: T;
}

/**
 * This hook is used to prevent the user from navigating away from the page if there are unsaved changes
 * detected within a form created using `react-hook-form`
 *
 * **IMPORTANT:** Only for usage in single-step forms. For multi-step forms utilizing Jotai, use `useUnsavedAtom` instead.
 *
 * @param isDirty The boolean value accessible in `form.formState.isDirty`
 */
function useUnsavedForm(isDirty: boolean) {
  const navGuard = useNavigationGuard({
    enabled: isDirty,
  });

  return {
    isGuardActive: navGuard.active,
    onConfirm: navGuard.accept,
    onCancel: navGuard.reject,
  };
}

/**
 * This hook is used to prevent the user from navigating away from the page if there are unsaved changes
 * detected within the atom. Use the hook within the root form component wrapping each step.
 *
 * **IMPORTANT:** Only for usage in multi-step forms. For single-step forms, use `useUnsavedForm` instead.
 *
 * **NOTE:** If the last step performs a redirect, make sure to disable the navigation guard before the redirect happens using `setDisabled(true)`
 *
 * @param atom The Jotai atom instance which holds the form state
 */
function useUnsavedAtom<T>(atom: PrimitiveAtom<T> & WithInitialValue<T>) {
  const initialValue = useRef({ ...atom });
  const currentValue = useAtomValue(atom);
  const setAtom = useSetAtom(atom);
  const [disabled, setDisabled] = useState(false);

  const checkIfDirty = useCallback(() => {
    return (
      JSON.stringify(currentValue) !== JSON.stringify(initialValue.current.init)
    );
  }, [currentValue, initialValue]);

  const isDirty = checkIfDirty();

  const navGuard = useNavigationGuard({
    enabled: disabled ? false : isDirty,
  });

  const onConfirm = useCallback(() => {
    setAtom(initialValue.current.init);
    navGuard.accept();
  }, [setAtom, navGuard, initialValue]);

  return {
    isDirty,
    isGuardActive: navGuard.active,
    onConfirm,
    onCancel: navGuard.reject,
    setDisabled,
  };
}

export { useUnsavedAtom, useUnsavedForm };
