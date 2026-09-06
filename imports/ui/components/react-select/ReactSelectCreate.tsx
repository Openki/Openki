import React, { RefAttributes } from "react";

import CreatableSelect from "react-select/creatable";
import { GroupBase } from "react-select";
import Select from "react-select/dist/declarations/src/Select";
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";
import { CreatableAdditionalProps } from "react-select/dist/declarations/src/useCreatable";
import { getBootstrapStyles } from "/imports/ui/components/react-select/getBootstrapStyles";

export interface Props<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>
  extends
    StateManagerProps<Option, IsMulti, Group>,
    CreatableAdditionalProps<Option, Group>,
    RefAttributes<Select<Option, IsMulti, Group>> {
  isInvalid?: boolean | undefined;
}

export function ReactSelectCreate<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>) {
  return <CreatableSelect {...props} styles={getBootstrapStyles<Option, IsMulti, Group>(props)} />;
}
