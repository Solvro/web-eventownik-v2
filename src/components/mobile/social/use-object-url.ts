"use client";

import { useEffect, useMemo } from "react";

/** Object URL for a local file preview, revoked when the file changes. */
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(
    () => (file === null ? null : URL.createObjectURL(file)),
    [file],
  );
  useEffect(() => {
    return () => {
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);
  return url;
}
