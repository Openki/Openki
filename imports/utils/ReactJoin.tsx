import React, { Fragment, type JSX } from "react";

/**
 * Like `Array.prototype.join()`, but used for joining React elements together with a separator.
 */
export function ReactJoin(
  elements: (string | false | JSX.Element | undefined)[],
  separator: JSX.Element = <>, </>,
): JSX.Element | null {
  const nonEmptyElements = elements.filter((v) => v);
  if (nonEmptyElements.length === 0) {
    return null;
  }

  return (
    <Fragment key={elements.length}>
      {nonEmptyElements.map((element, i) => (
        <Fragment key={i}>
          {element}
          {i < nonEmptyElements.length - 1 ? separator : null}
        </Fragment>
      ))}
    </Fragment>
  );
}
