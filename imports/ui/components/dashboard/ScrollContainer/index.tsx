import React, { useRef, useState, useLayoutEffect, ReactNode } from "react";
import { observeSize } from "../../../lib/observeHeight";

import "./styles.scss";

export function ScrollContainer({ children }: { children: ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(elementRef.current?.scrollLeft || 0);
  const [scrollLeftMax, setScrollLeftMax] = useState(0);

  function chechScroll() {
    const element = elementRef.current;
    if (element) {
      if (element.scrollWidth - element.clientWidth !== scrollLeftMax) {
        setScrollLeftMax(element.scrollWidth - element.clientWidth);
      }
    }
  }

  useLayoutEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observation = observeSize(elementRef.current, () => {
      chechScroll();
    });
    return () => {
      observation.stop();
    };
  });

  return (
    <div
      className="scroll-container d-flex align-items-stretch flex-row flex-nowrap pb-3 overflow-x-auto"
      style={{ scrollBehavior: "smooth" }}
      ref={elementRef}
      onScroll={() => {
        setScrollLeft(elementRef.current?.scrollLeft || 0);
      }}
    >
      {children}
      {scrollLeft !== 0 && (
        <a
          className="btn-scroll btn-scroll-left text-primary"
          onClick={() => {
            const element = elementRef.current;
            if (element) {
              element.scrollLeft = element.scrollLeft - element.clientWidth * 0.9;
            }
          }}
        >
          <i className="fa-solid fa-angle-left fa-fw" />
        </a>
      )}
      {elementRef.current &&
        scrollLeft !== elementRef.current.scrollWidth - elementRef.current.clientWidth && (
          <a
            className="btn-scroll btn-scroll-right text-primary"
            onClick={() => {
              const element = elementRef.current;
              if (element) {
                element.scrollLeft = element.scrollLeft + element.clientWidth * 0.9;
              }
            }}
          >
            <i className="fa-solid fa-angle-right fa-fw" />
          </a>
        )}
    </div>
  );
}
