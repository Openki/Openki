import { useLayoutEffect, useState } from "react";

function getWidth() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth);
}

export function useViewportSize() {
  const [width, setWidth] = useState(getWidth());
  useLayoutEffect(() => {
    function updateWidth() {
      if (width != getWidth()) {
        setWidth(getWidth());
      }
    }
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  return { width };
}
