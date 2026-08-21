import React, { RefAttributes } from "react";

import ReactSelectBase, { GroupBase, mergeStyles } from "react-select";
import Select from "react-select/dist/declarations/src/Select";
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";

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
>({ isInvalid = false, ...props }: Props<Option, IsMulti, Group>) {
  return (
    <ReactSelectBase
      {...props}
      styles={
        mergeStyles(
          {
            menu: (styles) => ({
              ...styles,
              zIndex: 1000,
            }),
            control: (styles) => ({
              ...styles,
              borderRadius: "var(--bs-border-radius)",
              ...(!isInvalid
                ? {
                    borderColor: "var(--bs-border-color)",
                    "&:hover": {
                      borderColor: "var(--bs-border-color)",
                    },
                    "&:focus-within": {
                      borderColor: "var(--bs-focus-ring-color)",
                      boxShadow: "0 0 0 0.25rem var(--bs-focus-ring-color)",
                    },
                  }
                : {
                    borderColor: "var(--bs-form-invalid-border-color)",
                    "&:hover": {
                      border: "1px solid var(--bs-form-invalid-border-color)",
                    },
                    "&:focus-within": {
                      boxShadow: "0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25)",
                      borderColor: "var(--bs-form-invalid-border-color)",
                    },
                  }),
            }),
            indicatorsContainer: (styles) => ({
              ...styles,
              "& > div": {
                color: "#343a40",
              },
              "& > div:hover": {
                color: "#343a40",
              },
            }),
          },
          props.styles,
        ) as any
      }
    />
  );
}
