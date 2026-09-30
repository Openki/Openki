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
    const element = elementRef.current;

    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  });
  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    // fix: inside a modal the inital not works
    setTimeout(() => {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";

      if (props.autoFocus) {
        element.focus();
        // Move cursor to the end
        element.setSelectionRange(-1, -1);
      }
    }, 0);
  }, []);

  return <textarea ref={elementRef} {...props} style={{ overflowY: "hidden", resize: "none" }} />;
}
