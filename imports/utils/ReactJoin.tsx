import React, { JSX } from "react";

export function ReactJoin(
  elements: (string | false | JSX.Element | undefined)[],
  separator: JSX.Element = <>, </>,
): JSX.Element | null {
  const notEmptyElements = elements.filter((v) => v);
  if (notEmptyElements.length === 0) {
    return null;
  }
  return <>{notEmptyElements.reduce((prev, curr) => [prev, separator, curr] as any)}</>;
}
