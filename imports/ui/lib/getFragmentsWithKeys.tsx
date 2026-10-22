import React, { Fragment, type ReactNode } from "react";

/**
 * Wrap an array of React nodes with keyed fragments to prevent React key errors.
 *
 * This for example required when using JSX Elements as variable substitiutions in the i18next `t()` function.
 * The error happens because JSX and primitive types make `t()` return `ReactNode[]` instead of a single `string`.
 * And the returned nodes are raw, and don't get wrapped with keyed fragments unless we do it explicitly with this .
 *
 * NOTE: An alternative instead of using this function might be to use the `<Trans />` component. But for now this fixes the error.
 */
export function getFragmentsWithKeys(items: ReactNode | ReactNode[]) {
  return Array.isArray(items) ? items.map((item, i) => <Fragment key={i}>{item}</Fragment>) : items;
}
