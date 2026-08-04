import React, { ReactNode, useRef, useEffect } from "react";
import { random } from "lodash-es";

export function Draggable({ children }: { children: ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    isDragging: false,
    pointerId: undefined as number | undefined,
    offsetX: 0,
    offsetY: 0,
    currentLeft: 0,
    currentTop: 0,
  });

  useEffect(() => {
    const box = elementRef.current;
    if (!box || !box.offsetParent) return;

    drag.current.currentLeft = random(-60, box.offsetParent.clientWidth - 270) - box.offsetLeft;
    drag.current.currentTop = random(-60, box.offsetParent.clientHeight - 270) - box.offsetTop;

    box.style.left = drag.current.currentLeft + "px";
    box.style.top = drag.current.currentTop + "px";
    box.style.rotate = random(-60, 60) + "deg";

    const handlePointerDown = (e: PointerEvent) => {
      drag.current.isDragging = true;
      drag.current.pointerId = e.pointerId;

      drag.current.offsetX = e.clientX - drag.current.currentLeft;
      drag.current.offsetY = e.clientY - drag.current.currentTop;

      box.setPointerCapture(e.pointerId);

      box.classList.add("shadow-lg", "cursor-grabbing");
      box.style.scale = "1.05";
      box.style.rotate = "";

      // move current element to the top using the current milliseconds of today
      const now = new Date();
      const millisecondsToday =
        now.getHours() * 60 * 60 * 1000 +
        now.getMinutes() * 60 * 1000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds();
      box.style.zIndex = String(millisecondsToday);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!drag.current.isDragging || e.pointerId !== drag.current.pointerId) {
        return;
      }

      const left = e.clientX - drag.current.offsetX;
      const top = e.clientY - drag.current.offsetY;

      drag.current.currentLeft = left;
      drag.current.currentTop = top;

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;

      e.preventDefault();
    };

    const stopDragging = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.pointerId) {
        return;
      }

      drag.current.isDragging = false;
      drag.current.pointerId = undefined;

      if (box.hasPointerCapture(e.pointerId)) {
        box.releasePointerCapture(e.pointerId);
      }

      box.classList.remove("shadow-lg", "cursor-grabbing");
      box.style.scale = "";
    };

    box.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      box.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        transition: "box-shadow 0.3s, scale 0.3s, rotate 0.3s",
        willChange: "left, top",
      }}
      className="group-card shadow-sm position-relative touch-none cursor-grab"
    >
      {children}
    </div>
  );
}
