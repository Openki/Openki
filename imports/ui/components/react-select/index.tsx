import React, { RefAttributes } from "react";

import ReactSelectBase, { GroupBase } from "react-select";
import Select from "react-select/dist/declarations/src/Select";
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";
import { getBootstrapStyles } from "/imports/ui/components/react-select/getBootstrapStyles";

export interface Props<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>
  extends StateManagerProps<Option, IsMulti, Group>, RefAttributes<Select<Option, IsMulti, Group>> {
  isInvalid?: boolean | undefined;
}

export function ReactSelect<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>) {
  return <ReactSelectBase {...props} styles={getBootstrapStyles(props)} />;
}
