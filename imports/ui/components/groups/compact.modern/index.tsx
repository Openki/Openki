import React, { useEffect, useRef, useState } from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { Panel } from "../../panel";
import { Full } from "./Full";
import { Thumb } from "./Thumb";
import { random } from "lodash-es";

export interface Props {
  group: GroupModel;
}
export function GroupCompact({ group }: Props) {
  const [view, setView] = useState("");

  const elementRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    isDragging: false,
    pointerId: null as number | null,
    offsetX: 0,
    offsetY: 0,
    currentLeft: random(-60, document.documentElement.clientWidth - 270),
    currentTop: random(-60, document.documentElement.clientHeight - 270),
  });

  useEffect(() => {
    const box = elementRef.current;
    if (!box) return;

    box.style.left = drag.current.currentLeft + "px";
    box.style.top = drag.current.currentTop + "px";
    box.style.rotate = random(-60, 60) + "deg";

    const handlePointerDown = (e: PointerEvent) => {
      drag.current.isDragging = true;
      drag.current.pointerId = e.pointerId;

      drag.current.offsetX = e.clientX - drag.current.currentLeft;
      drag.current.offsetY = e.clientY - drag.current.currentTop;

      box.setPointerCapture(e.pointerId);

      box.className = "shadow-lg";
      box.style.cursor = "grabbing";
      box.style.scale = "1.05";
      box.style.rotate = "";

      const now = new Date();
      const millisecondsToday =
        now.getHours() * 60 * 60 * 1000 +
        now.getMinutes() * 60 * 1000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds();

      box.style.zIndex = String(millisecondsToday);

      e.preventDefault();
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
      drag.current.pointerId = null;

      if (box.hasPointerCapture(e.pointerId)) {
        box.releasePointerCapture(e.pointerId);
      }

      box.className = "shadow-sm";
      box.style.cursor = "grab";
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
        touchAction: "none",
        cursor: "grab",
        position: "absolute",
        transition: "box-shadow 0.3s, scale 0.3s, rotate 0.3s",
      }}
      className="shadow-sm"
    >
      <Panel
        id={group._id}
        onChange={(view) => {
          setView(view);
        }}
        thumb={<Thumb group={group} />}
        full={<Full group={group} animation={view === "full" ? "show" : "hide"} />}
      />
    </div>
  );
}
