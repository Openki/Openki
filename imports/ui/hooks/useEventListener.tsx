import { RefObject, useLayoutEffect } from "react";

export function useEventListener<K extends keyof HTMLElementEventMap>(
  elementRef: RefObject<HTMLElement | null> | HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  elementRef: RefObject<Document | null> | Document,
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
): void;

export function useEventListener<T extends HTMLElement | Document>(
  elementRef: RefObject<T | null> | T,
  type: string,
  listener: EventListener,
): void;

/** Handle listening to eg. bootstrap events correctly in react. */
export function useEventListener<T extends HTMLElement | Document>(
  elementRef: RefObject<T | null> | T,
  type: string,
  listener: EventListener,
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
