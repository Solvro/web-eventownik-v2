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

  // Native (as opposed to React's "synthetic" ones) events interception
  useEffect(() => {
    const element = wrapperRef.current;
    if (element === null || !isSelected) {
      return;
    }

    const stopNativePropagation = (event: Event) => {
      event.stopPropagation();
    };

    // We listen for 'pointerdown' because dnd-kit uses Pointer Events by default.
    element.addEventListener("pointerdown", stopNativePropagation);
    element.addEventListener("mousedown", stopNativePropagation);

    return () => {
      element.removeEventListener("pointerdown", stopNativePropagation);
      element.removeEventListener("mousedown", stopNativePropagation);
    };
  }, [isSelected]);

  // NOTE: Autofocus Prosemirror on Puck block selection. Required, otherwise double-clicking
  // is required to focus the editor and a single click just selects the block
  useEffect(() => {
    if (isSelected && wrapperRef.current !== null) {
      const editable = wrapperRef.current.querySelector(".ProseMirror");

      if (editable !== null) {
        setTimeout(() => {
          (editable as HTMLElement).focus();
        }, 10);
      }
    }
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={wrapperRef}
      className="puck-richtext-container"
      // Disable browser native drag API (Ghost image)
      draggable={isSelected ? false : undefined}
      style={{
        minHeight: "24px",
        cursor: isSelected ? "text" : "default",
        position: "relative",
        zIndex: isSelected ? 10 : undefined,
      }}
      // React Event Handlers (Still good for internal logic/safety)
      onClick={(event) => {
        if (isSelected) {
          event.stopPropagation();
        }
      }}
      onKeyDown={(event) => {
        if (isSelected) {
          event.stopPropagation();
        }
      }}
      // Safety net for the browser native drag
      onDragStart={(event) => {
        if (isSelected) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {/* CSS to force correct cursor/selection styles */}
      <style>{`
        .puck-richtext-container .ProseMirror,
        .puck-richtext-container .ProseMirror * {
          user-select: text !important;
          -webkit-user-select: text !important;
          cursor: text !important;
        }
      `}</style>

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
