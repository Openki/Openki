import React from "react";
import ReactSelectBase, { GroupBase, Props } from "react-select";

import { getBootstrapStyles } from "/imports/ui/components/react-select/getBootstrapStyles";

export function ReactSelect<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>) {
  return <ReactSelectBase {...props} styles={getBootstrapStyles(props)} />;
}
