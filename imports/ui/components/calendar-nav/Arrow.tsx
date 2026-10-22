import React from "react";
import { useSessionEquals } from "/imports/ui/hooks/react-meteor-data";

export const units = ["week", "month", "year"] as const;

export type Direction = "previous" | "next";
export type Unit = (typeof units)[number];

export function Arrow(props: { direction: Direction }) {
  let isRTL = useSessionEquals("textDirectionality", "rtl");

  if (props.direction === "previous") {
    isRTL = !isRTL;
  }

  const direction = isRTL ? "left" : "right";

  return <i className={`fa-solid fa-arrow-${direction} fa-fw`} />;
}
