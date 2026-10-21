import React, { type Ref, useEffect, useRef } from "react";

function LegacyAutoGrowTextArea(
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
    // We intentionally want to only run this effect on the initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <textarea ref={elementRef} {...props} style={{ overflowY: "hidden", resize: "none" }} />;
}

export function AutoGrowTextArea(
  props: Omit<
    React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
    "style" | "onInput"
  > & { ref?: Ref<HTMLTextAreaElement> | undefined },
) {
  // NOTE: Once `field-sizing: content` becomes Baseline Widely Available,
  // then we should remove the `AutoGrowTextArea` component altogether - because all we need
  // is just one line of CSS which can be added to any `<textarea>`
  // Check browser support: https://caniuse.com/?search=field-sizing%3Acontent
  if (CSS.supports("field-sizing", "content")) {
    return (
      <textarea
        {...props}
        style={{
          overflowY: "hidden",
          resize: "none",
          fieldSizing: "content",
          // Backwards compatibility with old styling approach with explicit rows.
          // NOTE: Once we start to only using the field-sizing: content solution for textareas,
          // then we should also revisit every usage of <FormControl type="textarea" rows={n} />
          // and replace `rows={}` with an explicit minHeight (ideally defined via a CSS utility class).
          minHeight: (props.rows ?? 1) * 26,
        }}
      />
    );
  }

  return <LegacyAutoGrowTextArea {...props} />;
}
