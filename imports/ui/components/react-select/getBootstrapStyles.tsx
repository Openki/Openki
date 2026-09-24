import { GroupBase, mergeStyles, StylesConfig } from "react-select";

export function getBootstrapStyles<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: {
  isInvalid?: boolean | undefined;
  styles?: StylesConfig<Option, IsMulti, Group> | undefined;
}): import("react-select").StylesConfig<Option, IsMulti, Group> | undefined {
  return mergeStyles(
    {
      menu: (styles) => ({
        ...styles,
        zIndex: 1000,
      }),
      control: (styles) => ({
        ...styles,
        borderRadius: "var(--bs-border-radius)",
        ...(!props.isInvalid
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
  ) as any;
}
