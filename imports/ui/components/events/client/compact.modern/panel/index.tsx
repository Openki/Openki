import React, { useEffect, useRef, useState } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

import { useHash } from "/imports/utils/react-meteor-router";

import "./styles.scss";

export function Panel({
  id,
  thumb,
  full,
  onChange,
}: {
  id: string;
  thumb: JSX.Element;
  full: JSX.Element;
  onChange: (view: "thumb" | "full") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [close, setClose] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);

  const hash = (useHash() as string).slice(1);
  const hashParams = new URLSearchParams(hash);
  const isShowed = id === hashParams.get("show");
  useEffect(() => {
    onChange(isShowed ? "full" : "thumb");
    if (isShowed) {
      if (thumbRef.current) {
        scrollIntoView(thumbRef.current, {
          block: "nearest",
          inline: "nearest",
          scrollMode: "if-needed",
          behavior: "smooth" as ScrollBehavior,
        });
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

  return (
    <div className="panel">
      <div className="panel-thumb" ref={thumbRef}>
        <div
          className="panel-thumb-body"
          onClick={() => {
            location.hash = "show=" + id;
          }}
        >
          {thumb}
        </div>
      </div>
      {expanded && (
        <div ref={fullRef}>
          <div
            className="panel-full-bg"
            onClick={() => {
              location.hash = "";
            }}
          >
            <div
              className="panel-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
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
                <div
                  className="panel-minimize display-4"
                  onClick={() => {
                    location.hash = "";
                  }}
                >
                  <i className="fa-solid fa-xmark fa-fw"></i>
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
