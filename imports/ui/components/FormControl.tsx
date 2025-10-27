import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals } from "/imports/utils/react-meteor-data";

import { AutoGrowTextArea } from "./AutoGrowTextArea";

type Size = "large" | "medium" | "small";

interface CommonProps {
  id: string;
  label: ReactNode;
  size?: Size;
  prepend?: string | undefined;
  optional?: boolean | undefined;
  disabled?: boolean | undefined;
  onBlur?: (() => void) | undefined;
  error?: ReactNode;
}

interface TextInputProps {
  type: "text" | "tel" | "email" | "password";
  placeholder?: string | undefined;
  value: string;
  maxLength?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

interface TextareaProps {
  type: "textarea";
  rows?: number | undefined;
  placeholder?: string | undefined;
  value: string;
  maxLength?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

interface NumberInputProps {
  type: "number" | "integer";
  placeholder?: string | undefined;
  value: number;
  step?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  onChange?: ((value: number) => void) | undefined;
}

// Generic over the keys of options
interface SelectProps<K extends string> {
  type: "select";
  placeholder?: string | undefined;
  value: string;
  options: Record<K, string>;
  onChange?: ((value: K) => void) | undefined;
}

interface TimeInputProps {
  type: "time";
  value: string;
  step?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

export type Props<K extends string> = CommonProps &
  (TextInputProps | TextareaProps | NumberInputProps | SelectProps<K> | TimeInputProps);

function buildSizeClass(baseClass: string, size: Size = "medium") {
  switch (size) {
    case "large":
      return baseClass + "-lg";
    case "medium":
      return "";
    case "small":
      return baseClass + "-sm";
    default:
      throw new Error(`Unexpected value for prop "size": ${size}`);
  }
}

function getControlClassNames(
  type: string,
  size: Size | undefined,
  prepend: string | undefined,
  error: ReactNode,
) {
  let baseClass;
  switch (type) {
    case "select":
      baseClass = "form-select";
      break;
    default:
      baseClass = "form-control";
      break;
  }

  const className = [baseClass];

  if (!prepend) {
    // when a prepend is given then the sizing comes from input-group
    className.push(buildSizeClass(baseClass, size));
  }

  if (error) {
    className.push("is-invalid");
  }
  return className;
}

function getDescribedby(id: string, prepend: string | undefined, error: ReactNode) {
  const describedby = [];
  if (prepend && !prepend.startsWith("fa-")) {
    describedby.push(id + "-prepend");
  }
  if (error) {
    describedby.push(id + "-error");
  }
  return describedby;
}

/**
 * Factory to create input elements based on `type`
 */
function createInputElement<K extends string>(props: Props<K>) {
  const { id, type, size, prepend, optional, disabled, onBlur, error } = props;

  const commonProps = {
    id,
    className: getControlClassNames(type, size, prepend, error).join(" "),
    disabled,
    onBlur: () => onBlur?.(),
    "aria-describedby": getDescribedby(id, prepend, error).join(" ") || undefined,
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
          onChange={(ev) => props.onChange?.(ev.target.value)}
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
          onChange={(ev) => props.onChange?.(ev.target.value)}
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
            let value = ev.target.valueAsNumber;

            if (Number.isNaN(value) && ev.target.value === "") {
              // give back 0 in case of NaN because of ""
              value = 0;
            }

            if (type === "integer") {
              value = Math.round(value);
            }

            // prevent inputs get out of min max
            if (props.min !== undefined && value < props.min) {
              value = props.min;
            } else if (props.max !== undefined && value > props.max) {
              value = props.max;
            }

            props.onChange?.(value);
          }}
        />
      );

    case "select":
      return (
        <select
          {...commonProps}
          value={props.value}
          onChange={(ev) => props.onChange?.(ev.target.value as K)}
        >
          {!!props.placeholder && (
            <option disabled value="">
              {props.placeholder}
            </option>
          )}
          {Object.entries<ReactNode>(props.options).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      );

    case "time":
      return (
        <input
          type="time"
          {...commonProps}
          step={props.step}
          value={props.value}
          onChange={(ev) => props.onChange?.(ev.target.value)}
        />
      );

    default:
      throw new Error(`Unexpected value for prop type: ${type}`);
  }
}

function getGroupClassNames(size: Size | undefined, error: ReactNode) {
  const className = ["input-group", buildSizeClass("input-group", size)];

  className.push(buildSizeClass("input-group", size));

  if (error) {
    className.push("has-validation");
  }
  return className;
}

export function FormControl<K extends string>(props: Props<K>) {
  const { t } = useTranslation();
  const isRTL = useSessionEquals("textDirectionality", "rtl");

  const { id, size, label, prepend, optional, error } = props;

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

  if (prepend) {
    const prependElement = (
      <span className="input-group-text" id={`${id}-prepend`}>
        {prepend.startsWith("fa-") ? <i className={prepend} /> : prepend}
      </span>
    );
    inputElement = (
      <div className={getGroupClassNames(size, error).join(" ")}>
        {!isRTL && prependElement}
        {inputElement}
        {isRTL && prependElement}
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
