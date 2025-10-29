import React, { useEffect, useRef } from "react";

export function AutoGrowTextArea(
  props: Omit<
    React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
    "style" | "onInput"
  >,
) {
  // inspired from here: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize/25621277#25621277
  const elementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    elementRef.current.style.height = "auto";
    elementRef.current.style.height = elementRef.current.scrollHeight + "px";
  });

  return <textarea ref={elementRef} {...props} style={{ overflowY: "hidden", resize: "none" }} />;
}
