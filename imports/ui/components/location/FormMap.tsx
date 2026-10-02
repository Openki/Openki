import React, { ReactNode } from "react";
import { Coordinates, Edit } from "/imports/ui/components/location/edit";
import { useTranslation } from "react-i18next";

export function FormMap({
  id,
  label,
  optional,
  error,
  region,
  level,
  onChange,
  onFocus,
  onBlur,
  value,
  center,
}: {
  id: string;
  label: ReactNode;

  /**
   * shows "(optional)" in the label and
   * allow return values for number and integer to be empty
   */
  optional?: boolean | undefined;
  /**
   * shows a error message or
   * when only a boolean is given; by true: displays the control as invalid
   */
  error?: ReactNode;

  region?: string | undefined;
  level?: number | undefined;

  onChange: (
    newValue: { coordinates: Coordinates | undefined; level?: number | undefined } | undefined,
  ) => void;
  onFocus?: (() => void) | undefined;
  onBlur?: (() => void) | undefined;
} & (
  | {
      value?: Coordinates | undefined;
      center: Coordinates;
    }
  | {
      value: Coordinates;
      center?: Coordinates | undefined;
    }
)) {
  const { t } = useTranslation();

  return (
    <>
      <div
        id={`${id}-label`}
        className="form-label"
        style={{ cursor: "default" }}
        // simulate label
        onClick={() => document.getElementById(id)?.focus()}
      >
        {label} {!!optional && <small> {t("_inputField.optional")}</small>}
      </div>
      <Edit
        id={id}
        className={error ? "focus-ring-danger is-invalid" : undefined}
        region={region}
        center={center}
        coordinates={
          // One of "center" or "coordinates" are set, so we can ignore the error from typescript
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value as any
        }
        level={level}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={!optional}
        aria-describedby={error ? `${id}-error` : ""}
        aria-invalid={!!error}
        aria-labelledby={`${id}-label`}
      />
      {!!error && (
        <div id={`${id}-error`} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
