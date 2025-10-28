import React, { ReactNode } from "react";

import { CheckControl } from "./CheckControl";

// Generic over the keys of options
interface CommonProps<K extends string> {
  id: string;
  label: ReactNode;
  options: Record<K, ReactNode>;
  disabled?: boolean | undefined;
}

interface CheckBoxProps<K extends string> {
  type: "box" | "switch";
  value: K[];
  onChange?: ((value: K[]) => void) | undefined;
}

interface RadioProps<K extends string> {
  type: "radio";
  value: K;
  onChange?: ((value: K) => void) | undefined;
}

export type Props<K extends string> = CommonProps<K> & (CheckBoxProps<K> | RadioProps<K>);

/**
 * Factory to create input elements based on `type`
 */
function createCheckGroupElements<K extends string>(props: Props<K>) {
  const { id, type, options, value, disabled, onChange } = props;

  return Object.entries(options).map((e) => {
    const [optionValue, optionLabel] = e as [K, ReactNode];
    const commonProps = {
      key: optionValue,
      id: id + optionValue,
      label: optionLabel,
      disabled,
    };

    switch (type) {
      case "box":
      case "switch":
        return (
          <CheckControl
            type={type}
            {...commonProps}
            checked={value.includes(optionValue)}
            onChange={(checked) => {
              if (checked) {
                onChange?.([...value, optionValue]);
              } else {
                onChange?.(value.filter((v1) => v1 !== optionValue));
              }
            }}
          />
        );

      case "radio":
        return (
          <CheckControl
            type="radio"
            {...commonProps}
            name={id}
            checked={optionValue === value}
            onChange={(checked) => {
              if (checked) {
                onChange?.(optionValue);
              }
            }}
          />
        );

      default:
        throw new Error(`Unexpected value for prop type: ${type}`);
    }
  });
}

export function CheckGroup<K extends string>(props: Props<K>) {
  const { label } = props;

  return (
    <>
      <div className="form-label">{label}</div>
      {createCheckGroupElements(props)}
    </>
  );
}
