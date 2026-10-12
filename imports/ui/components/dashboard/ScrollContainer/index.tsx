import React, { useRef, useState, useLayoutEffect, ReactNode } from "react";
import { observeSize } from "../../../lib/observeHeight";
import { cx } from "/imports/utils/cx";

import "./styles.scss";
import { useTranslation } from "react-i18next";

export function ScrollContainer({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollLeftMax, setScrollLeftMax] = useState(0);
  const { t } = useTranslation();

  function checkScroll() {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    setScrollLeftMax(element.scrollWidth - element.clientWidth);
    setScrollLeft(element.scrollLeft);
  }

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    checkScroll();

    const observation = observeSize(element, checkScroll);

    return () => {
      observation.stop();
    };
  }, []);

  return (
    <div
      className={cx("scroll-container d-flex flex-row flex-nowrap overflow-x-auto", className)}
      style={{ scrollBehavior: "smooth" }}
      ref={elementRef}
      onScroll={(event) => {
        setScrollLeft(event.currentTarget.scrollLeft);
      }}
    >
      {children}
      {scrollLeft > 0 && (
        <button
          className="btn-scroll btn-scroll-left text-primary"
          aria-label={t("_button.previous", "Previous")}
          onClick={() => {
            const element = elementRef.current;
            if (element) {
              element.scrollLeft -= element.clientWidth * 0.9;
            }
          }}
        >
          <i className="fa-solid fa-angle-left fa-fw" />
        </button>
      )}

      {scrollLeft < scrollLeftMax && (
        <button
          className="btn-scroll btn-scroll-right text-primary"
          aria-label={t("_button.next", "Next")}
          onClick={() => {
            const element = elementRef.current;
            if (element) {
              element.scrollLeft += element.clientWidth * 0.9;
            }
          }}
        >
          <i className="fa-solid fa-angle-right fa-fw" />
        </button>
      )}
    </div>
  );
}
