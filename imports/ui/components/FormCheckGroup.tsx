import React, { ReactNode } from "react";

import { useTranslation } from "react-i18next";
import { FormCheck } from "./FormCheck";

// Generic over the keys of options
interface CommonProps<K extends string> {
  id: string;
  label?: ReactNode | undefined;
  /** shows "(optional)" in the label */
  optional?: boolean | undefined;
  options: Record<K, ReactNode>;
  disabled?: boolean | undefined;
}

interface CheckBoxProps<K extends string> {
  type: "box";
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
function createElements<K extends string>(props: Props<K>) {
  const { id, type, options, value, disabled, onChange } = props;

  return Object.entries(options).map((e) => {
    const [optionValue, optionLabel] = e as [K, ReactNode];
    const commonProps = {
      id: id + optionValue,
      label: optionLabel,
      disabled,
    };

    switch (type) {
      case "box":
        return (
          <FormCheck
            key={optionValue}
            {...commonProps}
            type={type}
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
          <FormCheck
            key={optionValue}
            {...commonProps}
            type="radio"
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

export function FormCheckGroup<K extends string>(props: Props<K>) {
  const { label, optional } = props;
  const { t } = useTranslation();

  return (
    <>
      {!!label && (
        <div className="form-label">
          {label} {!!optional && <small> {t("_inputField.optional")}</small>}
        </div>
      )}
      {createElements(props)}
    </>
  );
}
