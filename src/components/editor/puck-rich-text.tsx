"use client";

import type { Config } from "@measured/puck";
import { usePuck } from "@measured/puck";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import type { PuckComponents } from "./config";
import { RichTextEditor } from "./rich-text";

interface PuckRichTextProps {
  id: string;
  externalContent: string;
}

function PuckRichText({ externalContent, id }: PuckRichTextProps) {
  const { appState, dispatch, selectedItem } =
    usePuck<Config<PuckComponents>>();

  const [localContent, setLocalContent] = useState(externalContent);
  const [debouncedContent] = useDebounce(localContent, 300);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedItem?.props.id === id;

  // Mode switch
  useEffect(() => {
    const element = wrapperRef.current;
    if (element === null) {
      return;
    }

    const stopPropagation = (event: Event) => {
      event.stopPropagation();
    };

    // Text selection fix pt.1
    const preventDragStart = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };

    if (isSelected) {
      element.addEventListener("pointerdown", stopPropagation);
      element.addEventListener("mousedown", stopPropagation);
      element.addEventListener("click", stopPropagation);
      element.addEventListener("keydown", stopPropagation);

      // Text selection fix pt.2
      element.addEventListener("dragstart", preventDragStart);

      element.style.cursor = "text";
    } else {
      element.removeEventListener("pointerdown", stopPropagation);
      element.removeEventListener("mousedown", stopPropagation);
      element.removeEventListener("click", stopPropagation);
      element.removeEventListener("keydown", stopPropagation);
      element.removeEventListener("dragstart", preventDragStart);

      element.style.cursor = "default";
    }

    return () => {
      element.removeEventListener("pointerdown", stopPropagation);
      element.removeEventListener("mousedown", stopPropagation);
      element.removeEventListener("click", stopPropagation);
      element.removeEventListener("keydown", stopPropagation);
      element.removeEventListener("dragstart", preventDragStart);
    };
  }, [isSelected]);

  // Sync External Updates (Undo/Redo)
  // NOTE: We actually need an effect here. Tried my best to avoid it but seems needed for now.
  // eslint-disable-next-line react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change
  useEffect(() => {
    if (externalContent !== localContent) {
      // eslint-disable-next-line react-you-might-not-need-an-effect/no-derived-state
      setLocalContent(externalContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalContent]);

  /**
   * NOTE: This snapshot is crucial for internal update sync. Puck seems to be returning
   * new instances of `dispatch` and `selectedItem` on every render. Using "raw" values as deps in the effect,
   * we create an exhaustive deps warning, hence why we create a snapshot and only depend on
   * the "raw" debouncedContent value instead.
   */
  const puckSnapshot = useRef({
    appState,
    externalContent,
    dispatch,
    selectedItem,
    id,
  });
  puckSnapshot.current = {
    appState,
    externalContent,
    dispatch,
    selectedItem,
    id,
  };

  // Sync Internal Updates (Typing)
  useEffect(() => {
    const {
      appState: appStateSnapshot,
      externalContent: externalContentSnapshot,
      dispatch: dispatchSnapshot,
      selectedItem: selectedItemSnapshot,
      id: idSnapshot,
    } = puckSnapshot.current;

    if (debouncedContent === externalContentSnapshot) {
      return;
    }

    const targetId = idSnapshot || selectedItemSnapshot?.props.id;

    const newContent = appStateSnapshot.data.content.map((item) => {
      if (item.props.id === targetId) {
        return {
          ...item,
          props: { ...item.props, content: debouncedContent, id: targetId },
        };
      }
      return item;
    });

    dispatchSnapshot({
      type: "setData",
      data: { ...appStateSnapshot.data, content: newContent },
      recordHistory: true,
    });
  }, [debouncedContent]);

  return (
    <div
      ref={wrapperRef}
      className="puck-richtext-container"
      style={{
        minHeight: "24px",
        userSelect: "text",
        isolation: "isolate",
      }}
    >
      <RichTextEditor
        value={localContent}
        onChange={setLocalContent}
        readOnly={!isSelected}
        isSelected={isSelected}
      />
    </div>
  );
}

export { PuckRichText };
