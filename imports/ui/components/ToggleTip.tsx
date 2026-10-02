import React, { useRef, useState, useEffect } from "react";
import { Tooltip } from "/imports/startup/client/bootstrap";
import { useEventListener } from "/imports/ui/hooks/useEventListener";

/** A toggle tip that supports accessibility.
 *  *Hint: Do not use for information's that are necessary for a user to complete a task*
 */
export function ToggleTip({ label, title }: { label: string; title: string }) {
  const triggerElementRef = useRef<HTMLButtonElement>(null);

  const [tough, setTough] = useState(false);

  const [visible, setVisible] = useState(false);
  useEventListener(triggerElementRef, "hidden.bs.tooltip", () => {
    setVisible(false);
  });
  useEventListener(triggerElementRef, "shown.bs.tooltip", () => {
    setVisible(true);
  });

  const [show, setShow] = useState(false);
  useEffect(() => {
    const element = triggerElementRef.current;

    if (!element) {
      return;
    }
    const tooltip = Tooltip.getOrCreateInstance(element);

    if (show) {
      if (!visible) {
        tooltip.show();
      }
    } else {
      if (visible) {
        tooltip.hide();
      }
    }
  }, [show, visible]);

  return (
    <button
      type="button"
      ref={triggerElementRef}
      tabIndex={0}
      className="btn p-0 focus-ring"
      aria-label={label}
      data-bs-title={title}
      data-bs-trigger="manual"
      onMouseOver={() => {
        if (tough) {
          return;
        }
        setShow(true);
      }}
      onMouseOut={() => {
        if (tough) {
          return;
        }
        setShow(false);
      }}
      onFocus={() => {
        setShow(true);
        setTough(true);
      }}
      onBlur={() => {
        setShow(false);
        setTough(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setShow(false);
          setTough(false);
        }
      }}
      onClick={() => {
        setTough(true);
        const element = triggerElementRef.current;

        if (!element) {
          return;
        }

        if (show) {
          if (visible) {
            setTimeout(() => {
              setShow(true);
            }, 100);
            setShow(false);
          }
        } else {
          setShow(true);
        }
      }}
    >
      <i className="fa-regular fa-circle-question fa-fw"></i>
    </button>
  );
}
