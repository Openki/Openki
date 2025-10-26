import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

function AutoGrowTextArea(
  props: Omit<
    React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
    "style" | "onInput"
  >,
) {
  // inspired from here: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize/25621277#25621277

  const elementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.height = elementRef.current.scrollHeight + "px";
    }
  });

  return (
    <textarea
      ref={elementRef}
      {...props}
      style={{ overflowY: "hidden", resize: "none" }}
      onInput={(ev) => {
        ev.currentTarget.style.height = "auto";
        ev.currentTarget.style.height = ev.currentTarget.scrollHeight + "px";
      }}
    />
  );
}

type Size = "large" | "medium" | "small";

interface CommonProps {
  id: string;
  label: string;
  size?: Size;
  addon?: string | undefined;
  optional?: boolean | undefined;
  disabled?: boolean | undefined;
  onBlur?: (() => void) | undefined;
  error?: string | undefined;
}

interface TextInputProps {
  type: "text" | "tel" | "email" | "password";
  placeholder?: string | undefined;
  value: string;
  maxLength?: number | undefined;
  onChange?: ((newValue: string) => void) | undefined;
}

interface TextareaProps {
  type: "textarea";
  rows?: number | undefined;
  placeholder?: string | undefined;
  value: string;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  onChange?: ((newValue: string) => void) | undefined;
}

interface NumberInputProps {
  type: "number" | "integer";
  placeholder?: string | undefined;
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

export type Props = CommonProps &
  (TextInputProps | TextareaProps | NumberInputProps | TimeInputProps);

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

function getClassNames(size: Size | undefined, error: string | undefined) {
  const className = ["form-control", getSizeClass(size)];
  if (error) {
    className.push("is-invalid");
  }
  return className;
}

function getDescribedby(id: string, addon: string | undefined, error: string | undefined) {
  const describedby = [];
  if (addon && !addon.startsWith("fa-")) {
    describedby.push(id + "-addon");
  }
  if (error) {
    describedby.push(id + "-error");
  }
  return describedby;
}

/**
 * Factory to create input elements based on `type`
 */
function createInputElement(props: Props) {
  const { id, type, size, addon, optional, disabled, onBlur, error } = props;

  const className = getClassNames(size, error);

  const describedby = getDescribedby(id, addon, error);

  const commonProps = {
    id,
    className: className.join(" "),
    disabled,
    onBlur: () => onBlur?.(),
    "aria-describedby": describedby.join(" ") || undefined,
    "aria-invalid": !!error,
  };

  switch (type) {
    case "text":
    case "tel":
    case "email":
    case "password":
      return (
        <input
          type={type}
          {...commonProps}
          placeholder={props.placeholder}
          value={props.value}
          maxLength={props.maxLength}
          onChange={(ev) => props.onChange?.(ev.currentTarget.value)}
        />
      );

    case "textarea":
      return (
        <AutoGrowTextArea
          {...commonProps}
          rows={props.rows}
          placeholder={props.placeholder}
          value={props.value}
          maxLength={props.maxLength}
          onChange={(ev) => props.onChange?.(ev.currentTarget.value)}
        />
      );

    case "number":
    case "integer":
      return (
        <input
          type="number"
          {...commonProps}
          placeholder={props.placeholder}
          step={props.step}
          min={props.min}
          max={props.max}
          inputMode={type === "integer" ? "numeric" : "decimal"}
          // show empty input instead of 0
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

            // prevent inputs get out of min max
            if (props.min !== undefined && newValue < props.min) {
              newValue = props.min;
            } else if (props.max !== undefined && newValue > props.max) {
              newValue = props.max;
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
  const { id, label, addon, optional, error } = props;

  // Create input using a factory
  let inputElement = (
    <>
      {createInputElement(props)}
      {!!error && (
        <div id={`${id}-error`} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
    </>
  );

  if (addon) {
    inputElement = (
      <div className={`input-group ${error ? "has-validation" : ""}`}>
        <span className="input-group-text" id={`${id}-addon`}>
          {addon.startsWith("fa-") ? <i className={addon} /> : addon}
        </span>
        {inputElement}
      </div>
    );
  }

  return (
    <>
      <label className="form-label" htmlFor={id}>
        {label} {!!optional && <small> {t("_inputField.optional")}</small>}
      </label>
      {inputElement}
    </>
  );
}
