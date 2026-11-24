// oxlint-disable-next-line unicorn/require-module-specifiers
import type {} from "react-select/base";
import type Select from "react-select/base";

declare module "react-select/base" {
  export interface Props<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
  > extends RefAttributes<Select<Option, IsMulti, Group>> {
    isInvalid?: boolean | undefined;
  }
}
