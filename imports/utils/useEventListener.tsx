import { RefObject, useLayoutEffect } from "react";

/** Handle listening to eg. bootstrap events correctly in react.  */
export function useEventListener<T extends HTMLElement>(
  elementRef: RefObject<T | null> | HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
) {
  useLayoutEffect(() => {
    const element = "current" in elementRef ? elementRef.current : elementRef;
    if (!element) {
      return;
    }

    element.addEventListener(type, listener);
    return () => {
      element.removeEventListener(type, listener);
    };
  });
}
