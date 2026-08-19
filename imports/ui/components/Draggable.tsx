import React, { ReactNode, useEffect, useRef } from "react";
import { random } from "lodash-es";

export function Draggable({ children }: { children: ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    pointerId: undefined as number | undefined,
    isPointerDown: false,
    isDragging: false,

    startX: 0,
    startY: 0,

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

    box.style.left = `${drag.current.currentLeft}px`;
    box.style.top = `${drag.current.currentTop}px`;
    box.style.rotate = `${random(-60, 60)}deg`;

    const handlePointerDown = (e: PointerEvent) => {
      if (drag.current.isPointerDown) {
        return;
      }

      drag.current.isPointerDown = true;
      drag.current.isDragging = false;
      drag.current.pointerId = e.pointerId;

      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;

      // Rotate the element in normal position and move it to the front
      box.style.rotate = "";
      box.style.scale = "1.05";
      box.classList.add("shadow-lg", "cursor-grabbing", "select-none");

      const now = new Date();
      const millisecondsToday =
        now.getHours() * 60 * 60 * 1000 +
        now.getMinutes() * 60 * 1000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds();

      box.style.zIndex = String(millisecondsToday);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!drag.current.isPointerDown || e.pointerId !== drag.current.pointerId) {
        return;
      }

      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;

      // No drag yet: only start once 5px of movement has taken place
      if (!drag.current.isDragging) {
        const distance = Math.hypot(dx, dy);
        if (distance < 5 /* px */) {
          return;
        }

        drag.current.isDragging = true;

        drag.current.offsetX = e.clientX - drag.current.currentLeft;

        drag.current.offsetY = e.clientY - drag.current.currentTop;

        box.setPointerCapture(e.pointerId);
      }

      if (!drag.current.isDragging) {
        return;
      }

      e.preventDefault();

      const left = e.clientX - drag.current.offsetX;
      const top = e.clientY - drag.current.offsetY;

      drag.current.currentLeft = left;
      drag.current.currentTop = top;

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
    };

    const handlePointerUpCancel = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.pointerId) {
        return;
      }

      const wasDragging = drag.current.isDragging;

      drag.current.isPointerDown = false;
      drag.current.isDragging = false;
      drag.current.pointerId = undefined;

      if (box.hasPointerCapture(e.pointerId)) {
        box.releasePointerCapture(e.pointerId);
      }

      box.classList.remove("shadow-lg", "cursor-grabbing", "select-none");
      box.style.scale = "";

      // After dragging, we prevent the resulting click
      if (wasDragging) {
        e.preventDefault();
      }
    };

    box.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", handlePointerUpCancel);
    window.addEventListener("pointercancel", handlePointerUpCancel);

    return () => {
      box.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUpCancel);
      window.removeEventListener("pointercancel", handlePointerUpCancel);
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        transition: "box-shadow 0.3s, scale 0.3s, rotate 0.3s",
        willChange: "left, top",
      }}
      className="draggable shadow-sm position-relative touch-none cursor-grab d-flex align-items-stretch"
    >
      {children}
    </div>
  );
}
