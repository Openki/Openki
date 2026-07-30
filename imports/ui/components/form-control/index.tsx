import React, { FocusEventHandler, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { buildSizeClass, Size } from "/imports/ui/lib/buildSizeClass";
import { cx } from "/imports/utils/cx";

import { AutoGrowTextArea } from "./AutoGrowTextArea";
import { DateInput } from "./DateInput";
import { Richtext } from "./Richtext";

interface CommonProps {
  id: string;
  label: Exclude<ReactNode, null | undefined>;
  size?: Size;
  /**
   * A ReactNode, string or icon prefixed as part of the control,
   * strings beginning with "fa-" are treated as icons
   */
  prepend?: ReactNode;
  /**
   * A ReactNode, string or icon appended as part of the control (e.g. a toggle button).
   * Strings beginning with "fa-" are treated as icons, similar to prepend.
   */
  append?: ReactNode;
  /**
   * shows "(optional)" in the label and
   * allow return values for number and integer to be empty
   */
  optional?: boolean | undefined;
  disabled?: boolean | undefined;
  onFocus?: FocusEventHandler<HTMLElement> | undefined;
  onBlur?: FocusEventHandler<HTMLElement> | undefined;
  /**
   * shows a error message or
   * when only a boolean is given; by true: displays the control as invalid
   */
  error?: ReactNode;
}

interface TextInputProps {
  type: "text" | "tel" | "email" | "url" | "password" | "search";
  autoFocus?: boolean | undefined;
  /** Used for instructions or an example of the required data format. */
  placeholder?: string | undefined;
  value: string;
  autoComplete?: HTMLInputElement["autocomplete"] | undefined;
  maxLength?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

interface TextareaProps {
  type: "textarea";
  rows?: number | undefined;
  autoFocus?: boolean | undefined;
  /** Used for instructions or an example of the required data format. */
  placeholder?: string | undefined;
  value: string;
  autoComplete?: HTMLTextAreaElement["autocomplete"] | undefined;
  maxLength?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

interface RichtextProps {
  type: "richtext";
  /** Used for instructions or an example of the required data format. */
  placeholder?: string | undefined;
  value: string;
  onChange?:
    | ((
        /** string with html content */ value: string,
        /** number of visible characters */ numberOfCharacters: number,
      ) => void)
    | undefined;
}

interface NumberInputProps {
  type: "number" | "integer";
  /** Used for instructions or an example of the required data format. */
  placeholder?: string | undefined;
  value: number;
  autoComplete?: HTMLInputElement["autocomplete"] | undefined;
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
  autoComplete?: HTMLSelectElement["autocomplete"] | undefined;
  onChange?: ((value: K) => void) | undefined;
}

interface TimeInputProps {
  type: "time";
  value: string;
  autoComplete?: HTMLInputElement["autocomplete"] | undefined;
  step?: number | undefined;
  onChange?: ((value: string) => void) | undefined;
}

interface DateInputProps {
  type: "date";
  /** expected format is "YYYY-MM-DD" */
  value: string;
  /** min/start date, the expected format is "YYYY-MM-DD" */
  min?: string | undefined;
  /** max/end date, the expected format is "YYYY-MM-DD" */
  max?: string | undefined;
  onChange?:
    | ((
        /** in format "YYYY-MM-DD" */
        value: string,
      ) => void)
    | undefined;
}

export type Props<K extends string> = CommonProps &
  (
    | TextInputProps
    | TextareaProps
    | RichtextProps
    | NumberInputProps
    | SelectProps<K>
    | TimeInputProps
    | DateInputProps
  );

function getControlClassNames(
  type: string,
  size: Size | undefined,
  prepend: ReactNode,
  append: ReactNode,
  isInvalid: boolean,
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

  if (!prepend || !append) {
    // when a prepend or append is given then the sizing comes from input-group
    className.push(buildSizeClass(baseClass, size));
  }

  if (isInvalid) {
    className.push("is-invalid");
  }
  return className;
}

function getDescribedby(
  id: string,
  prepend: ReactNode,
  append: ReactNode,
  hasErrorMessage: boolean,
) {
  const describedby = [];
  if (prepend && typeof prepend === "string" && !prepend.startsWith("fa-")) {
    describedby.push(id + "-prepend");
  }
  if (append && typeof append === "string" && !append.startsWith("fa-")) {
    describedby.push(id + "-append");
  }
  if (hasErrorMessage) {
    describedby.push(id + "-error");
  }
  return describedby;
}

/**
 * Factory to create input elements based on `type`
 */
function createInputElement<K extends string>(props: Props<K>) {
  const { id, type, size, prepend, append, optional, disabled, onFocus, onBlur, error } = props;

  const isInvalid = !!error;
  const commonProps = {
    id,
    className: getControlClassNames(type, size, prepend, append, isInvalid).join(" "),
    disabled,
    autoComplete: "autoComplete" in props ? props.autoComplete : undefined,
    required: !optional,
    onFocus,
    onBlur,
    "aria-describedby":
      getDescribedby(id, prepend, append, typeof error !== "boolean" && !!error).join(" ") ||
      undefined,
    "aria-invalid": isInvalid,
  };

  switch (type) {
    case "text":
    case "tel":
    case "email":
    case "url":
    case "password":
    case "search":
      return (
        <input
          type={type}
          {...commonProps}
          autoFocus={props.autoFocus}
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
          autoFocus={props.autoFocus}
          placeholder={props.placeholder}
          value={props.value}
          maxLength={props.maxLength}
          onChange={(ev) => props.onChange?.(ev.target.value)}
        />
      );

    case "richtext":
      return (
        <Richtext
          {...commonProps}
          aria-labelledby={`${id}-label`}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(value, numberOfCharacters) => props.onChange?.(value, numberOfCharacters)}
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
            // when optional is set then it is allow to choose empty value
            <option disabled={!props.optional} value="">
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

    case "date":
      return (
        <DateInput
          {...commonProps}
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={props.onChange}
        />
      );

    default:
      throw new Error(`Unexpected value for prop type: ${type}`);
  }
}

function createAddonElement(id: string, addon: ReactNode, inputId: string) {
  return typeof addon !== "string" ? (
    addon
  ) : (
    <span
      className="input-group-text"
      id={id}
      onClick={() => document.getElementById(inputId)?.focus()}
    >
      {addon.startsWith("fa-") ? <i className={addon} /> : addon}
    </span>
  );
}

function createInvalidFeedbackElement<K extends string>(props: Props<K>) {
  return (
    <div id={`${props.id}-error`} className="invalid-feedback" role="alert">
      {props.error}
    </div>
  );
}

/** Form control with label, validation message, etc. it makes it easy to follow standards for accessibility */
export function FormControl<K extends string>(props: Props<K>) {
  const { t } = useTranslation();

  const { id, size, label, prepend, append, optional, error } = props;
  const hasErrorMessage = typeof error !== "boolean" && !!error;

  // Create input using a factory
  let inputElement;

  if (prepend || append) {
    /* When prepend or append is present, render inside input-group.
    Error message is placed after append to prevent overlap with
    Bootstrap's validation icon and the append button. */
    inputElement = (
      <div
        className={cx(
          "input-group",
          buildSizeClass("input-group", size),
          hasErrorMessage && "has-validation",
        )}
      >
        {prepend && createAddonElement(`${id}-prepend`, prepend, id)}
        {createInputElement(props)}
        {append && createAddonElement(`${id}-append`, append, id)}
        {hasErrorMessage && createInvalidFeedbackElement(props)}
      </div>
    );
  } else {
    // Default: no prepend or append
    inputElement = (
      <>
        {createInputElement(props)}
        {hasErrorMessage && createInvalidFeedbackElement(props)}
      </>
    );
  }

  const labelChild = (
    <>
      {label} {!!optional && <small> {t("_inputField.optional")}</small>}
    </>
  );
  return (
    <>
      {props.type === "richtext" ? (
        /* special case for richtext, we have to simulate label & textarea element */
        <div
          id={`${id}-label`}
          className="form-label"
          style={{ cursor: "default" }}
          onClick={() => document.getElementById(id)?.focus()}
        >
          {labelChild}
        </div>
      ) : (
        <label className="form-label" htmlFor={id}>
          {labelChild}
        </label>
      )}
      {inputElement}
    </>
  );
}
