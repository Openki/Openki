import React, { Fragment, type ReactNode } from "react";

/**
 * Wrap an array of React nodes with keyed fragments to prevent React errors.
 * This for example required when using JSX Elements as variable substitiutions from the i18next `t()` function.
 */
export function getFragmentsWithKeys(items: ReactNode | ReactNode[]) {
  return Array.isArray(items) ? items.map((item, i) => <Fragment key={i}>{item}</Fragment>) : items;
}
