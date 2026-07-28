import React, { ReactNode, useEffect, useRef, useState } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

import { ScrollBarHelper } from "/imports/startup/client/bootstrap";
import { useHash } from "/imports/utils/react-meteor-router";
import { useEventListener } from "/imports/utils/useEventListener";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

// Source: https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t/326076#326076
const inIframe = window.self !== window.top;

function scroll(element: HTMLElement, behavior: ScrollBehavior) {
  if (inIframe) {
    // in iframe we use the native scrollIntoView function, because it supports
    // scrolling the parent window.
    element.scrollIntoView({
      behavior,
    });
  } else {
    scrollIntoView(element, {
      scrollMode: "if-needed",
      behavior,
    });
  }
}

export function Panel({
  id,
  thumb,
  full,
  onChange,
}: {
  id: string;
  thumb: ReactNode;
  full: ReactNode;
  onChange: (view: "thumb" | "full") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [close, setClose] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);

  const hash = (useHash() as string).slice(1);
  const hashParams = new URLSearchParams(hash);
  const isShowed = id === hashParams.get("show");

  function handleOpen() {
    location.hash = `show=${id}`;
    new ScrollBarHelper().hide();
  }

  function handleClose() {
    const x = window.scrollX;
    const y = window.scrollY;

    location.hash = "";
    new ScrollBarHelper().reset();

    window.scrollTo(x, y);

    if (thumbRef.current) {
      scroll(thumbRef.current, "instant");
    }
  }

  useEffect(() => {
    onChange(isShowed ? "full" : "thumb");
    if (isShowed) {
      if (thumbRef.current) {
        scroll(thumbRef.current, "smooth");
      }
      setExpanded(true);
    } else {
      setClose(true);
    }
  }, [isShowed]);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => {
        fullRef.current?.classList.add("panel-animation");
      }, 0);
    }
  }, [expanded]);
  useEffect(() => {
    if (close) {
      fullRef.current?.classList.remove("panel-animation");
      setTimeout(() => {
        setExpanded(false);
        setClose(false);
      }, 350);
    }
  }, [close]);

  useEventListener(document, "keyup", (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  });

  return (
    <div className={cx("panel", inIframe && "panel-iframe")}>
      <div className="panel-thumb" ref={thumbRef}>
        <div className="panel-thumb-body" onClick={handleOpen}>
          {thumb}
        </div>
      </div>
      {expanded && (
        <div ref={fullRef}>
          <div className="panel-full-bg overflow-auto smooth-scroll" onClick={handleClose}>
            <div
              className="panel-full"
              onClick={(e) => e.stopPropagation()}
              style={{
                left: thumbRef.current?.getBoundingClientRect().left,
                right: thumbRef.current?.getBoundingClientRect().right,
                width: thumbRef.current?.clientWidth,
                top: thumbRef.current?.getBoundingClientRect().top,
                height: thumbRef.current?.clientHeight,
              }}
            >
              <div className="panel-full-body">
                {full}
                <div className="panel-minimize">
                  <button className="btn-close btn-close-circle" onClick={handleClose}></button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
}
