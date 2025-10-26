import React from "react";
import { useTranslation } from "react-i18next";

export function FormControl(
  props: {
    label: string;
    size?: "large" | "medium" | "small";
    addon?: string | undefined;
    placeholder?: string | undefined;
    optional?: boolean | undefined;
    disabled?: boolean | undefined;
    onBlur?: (() => void) | undefined;
    error?: string | undefined;
  } & (
    | { type: "text" | "email" | "password"; value: string; onChange?: (newValue: string) => void }
    | {
        type: "number" | "integer";
        value: number;
        step?: number | undefined;
        min?: number | undefined;
        max?: number | undefined;
        onChange?: (newValue: number) => void;
      }
    | {
        type: "time";
        value: string;
        step?: number | undefined;
        onChange?: (newValue: string) => void;
      }
  ),
) {
  const { t } = useTranslation();

  const {
    type = "text",
    label,
    size = "medium",
    addon,
    placeholder,
    value,
    optional,
    disabled,
    onBlur,
    error,
  } = props;

  const className = ["form-control"];

  switch (size) {
    case "large":
      className.push("form-control-lg");
      break;
    case "small":
      className.push("form-control-sm");
      break;
  }

  if (error) {
    className.push("is-invalid");
  }

  let inputElement = (
    <>
      <input
        type={type === "integer" ? "number" : type}
        className={className.join(" ")}
        placeholder={placeholder}
        /* show empty input instead of 0 */
        value={(type === "number" || type === "integer") && optional ? value || "" : value}
        step={"step" in props ? props.step : undefined}
        min={"min" in props ? props.min : undefined}
        max={"max" in props ? props.max : undefined}
        disabled={disabled}
        onChange={(ev) => {
          if (props.type === "number" || props.type === "integer") {
            let newValue = ev.currentTarget.valueAsNumber;

            if (Number.isNaN(newValue) && ev.currentTarget.value === "") {
              // give back 0 in case of NaN because of ""
              newValue = 0;
            }

            if (props.type === "integer") {
              newValue = Math.round(newValue);
            }

            props.onChange?.(newValue);
          } else {
            props.onChange?.(ev.currentTarget.value);
          }
        }}
        onBlur={() => {
          onBlur?.();
        }}
      />

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
