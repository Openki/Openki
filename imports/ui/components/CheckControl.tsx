import React, { ReactNode } from "react";

interface CommonProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
}

interface CheckBoxProps {
  type: "box" | "switch";
}

interface RadioProps {
  type: "radio";
  name?: string | undefined;
}

export type Props = CommonProps & (CheckBoxProps | RadioProps);

export function CheckControl(props: Props) {
  const { id, type, label, hint, disabled, checked, onChange } = props;
  return (
    <div className={`form-check${type === "switch" ? " form-switch" : ""}`}>
      <input
        id={id}
        name={"name" in props ? props.name : undefined}
        className="form-check-input"
        type={type === "radio" ? "radio" : "checkbox"}
        checked={checked}
        disabled={disabled}
        onChange={(ev) => {
          onChange?.(ev.target.checked);
        }}
        role={type === "switch" ? "switch" : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
      {!!hint && (
        <div id={`${id}-hint`} className="form-text">
          {hint}
        </div>
      )}
    </div>
  );
}
