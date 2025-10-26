import React from "react";
import { useTranslation } from "react-i18next";

type Size = "large" | "medium" | "small";

interface CommonProps {
  label: string;
  size?: Size;
  addon?: string | undefined;
  placeholder?: string | undefined;
  optional?: boolean | undefined;
  disabled?: boolean | undefined;
  onBlur?: (() => void) | undefined;
  error?: string | undefined;
}

interface TextInputProps {
  type: "text" | "email" | "password";
  value: string;
  onChange?: ((newValue: string) => void) | undefined;
}

interface NumberInputProps {
  type: "number" | "integer";
  value: number;
  step?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  onChange?: ((newValue: number) => void) | undefined;
}

interface TimeInputProps {
  type: "time";
  value: string;
  step?: number | undefined;
  onChange?: ((newValue: string) => void) | undefined;
}

export type Props = CommonProps & (TextInputProps | NumberInputProps | TimeInputProps);

function getSizeClass(size: Size = "medium") {
  switch (size) {
    case "large":
      return "form-control-lg";
    case "medium":
      return "";
    case "small":
      return "form-control-sm";
    default:
      throw new Error(`Unexpected value for prop "size": ${size}`);
  }
}

/**
 * Factory to create input elements based on `type`
 */
function createInputElement(props: Props) {
  const { type, size, placeholder, optional, disabled, onBlur, error } = props;

  const className = ["form-control", getSizeClass(size)];
  if (error) {
    className.push("is-invalid");
  }

  const commonProps = {
    className: className.join(" "),
    placeholder,
    disabled,
    onBlur: () => onBlur?.(),
  };

  switch (type) {
    case "text":
    case "email":
    case "password":
      return (
        <input
          type={type}
          {...commonProps}
          value={props.value}
          onChange={(ev) => props.onChange?.(ev.currentTarget.value)}
        />
      );

    case "number":
    case "integer":
      return (
        <input
          type="number"
          {...commonProps}
          step={props.step}
          min={props.min}
          max={props.max}
          value={optional ? props.value || "" : props.value}
          onChange={(ev) => {
            let newValue = ev.currentTarget.valueAsNumber;

            if (Number.isNaN(newValue) && ev.currentTarget.value === "") {
              // give back 0 in case of NaN because of ""
              newValue = 0;
            }

            if (type === "integer") {
              newValue = Math.round(newValue);
            }

            props.onChange?.(newValue);
          }}
        />
      );

    case "time":
      return (
        <input
          type="time"
          {...commonProps}
          step={props.step}
          value={props.value}
          onChange={(ev) => props.onChange?.(ev.currentTarget.value)}
        />
      );

    default:
      throw new Error(`Unexpected value for prop "type": ${type}`);
  }
}

export function FormControl(props: Props) {
  const { t } = useTranslation();
  const { label, addon, optional, error } = props;

  // Create input using the factory
  let inputElement = (
    <>
      {createInputElement(props)}
      {!!error && <div className="invalid-feedback">{error}</div>}
    </>
  );

  if (addon) {
    inputElement = (
      <div className={`input-group ${error ? "has-validation" : ""}`}>
        <div className="input-group-text">
          {addon.startsWith("fa-") ? <i className={addon} /> : addon}
        </div>
        {inputElement}
      </div>
    );
  }

  return (
    <>
      <label className="form-label">
        {label} {!!optional && <small> {t("_inputField.optional")}</small>}
      </label>
      {inputElement}
    </>
  );
}
