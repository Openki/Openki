import React, { ReactNode } from "react";

import { CheckControl } from "/imports/ui/components/events/edit/form-control/CheckControl";

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

export function CheckGroup<K extends string>({
  id,
  type,
  label,
  options,
  value,
  disabled,
  onChange,
}: Props<K>) {
  return (
    <>
      <label className="form-label">{label}</label>
      {Object.entries<ReactNode>(options).map(([optionValue, optionLabel]) => {
        const key = optionValue as K;
        const checked = type === "radio" ? key === value : value.includes(key);

        return (
          <CheckControl
            key={optionValue}
            id={id + optionValue}
            type={type}
            name={type === "radio" ? id : undefined}
            label={optionLabel}
            checked={checked}
            disabled={disabled}
            onChange={(checked) => {
              if (type === "radio") {
                if (checked) {
                  onChange?.(key);
                }
              } else {
                if (checked) {
                  onChange?.([...value, key]);
                } else {
                  onChange?.(value.filter((v1) => v1 !== key));
                }
              }
            }}
          />
        );
      })}
    </>
  );
}
