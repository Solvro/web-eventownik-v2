"use client";

import { usePuck } from "@measured/puck";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import { RichTextEditor } from "./rich-text";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

interface PuckRichTextProps {
  id: string;
  initialContent: string;
}

function PuckRichText({ initialContent, id }: PuckRichTextProps) {
  const { appState, dispatch, selectedItem } = usePuck();

  const [localContent, setLocalContent] = useState(initialContent);
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
      // element.addEventListener("click", stopPropagation);
      element.addEventListener("keydown", stopPropagation);

      // Text selection fix pt.2
      element.addEventListener("dragstart", preventDragStart);

      element.style.cursor = "text";
    } else {
      element.removeEventListener("pointerdown", stopPropagation);
      element.removeEventListener("mousedown", stopPropagation);
      // element.removeEventListener("click", stopPropagation);
      element.removeEventListener("keydown", stopPropagation);
      element.removeEventListener("dragstart", preventDragStart);

      element.style.cursor = "default";
    }

    return () => {
      element.removeEventListener("pointerdown", stopPropagation);
      element.removeEventListener("mousedown", stopPropagation);
      // element.removeEventListener("click", stopPropagation);
      element.removeEventListener("keydown", stopPropagation);
      element.removeEventListener("dragstart", preventDragStart);
    };
  }, [isSelected]);

  // 3. Sync External Updates (Undo/Redo)
  useEffect(() => {
    if (initialContent !== localContent) {
      setLocalContent(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  // 4. Sync Internal Updates (Typing)
  useEffect(() => {
    if (debouncedContent === initialContent) {
      return;
    }

    // Fallback logic for safety
    const targetId = id || selectedItem?.props.id;
    if (targetId === null) {
      return;
    }

    const newContent = appState.data.content.map((item) => {
      if (item.props.id === targetId) {
        return {
          ...item,
          props: { ...item.props, content: debouncedContent, id: targetId },
        };
      }
      return item;
    });

    dispatch({
      type: "setData",
      data: { ...appState.data, content: newContent },
    });
  }, [
    debouncedContent,
    appState.data,
    dispatch,
    id,
    initialContent,
    selectedItem,
  ]);

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
