import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { type GroupBase } from "react-select";

import { getBootstrapStyles } from "/imports/ui/components/react-select/getBootstrapStyles";

export interface Props<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends CreatableProps<Option, IsMulti, Group> {
  isInvalid?: boolean | undefined;
}

export function ReactSelectCreate<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>) {
  return <CreatableSelect {...props} styles={getBootstrapStyles<Option, IsMulti, Group>(props)} />;
}
