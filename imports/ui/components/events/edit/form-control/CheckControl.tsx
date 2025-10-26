import React, { ReactNode } from "react";

export function CheckControl({
  id,
  type,
  label,
  disabled,
  checked,
  onChange,
}: {
  id: string;
  type: "box" | "switch" | "radio";
  checked?: boolean | undefined;
  label: ReactNode;
  disabled?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
}) {
  return (
    <div className={`form-check${type === "switch" ? " form-switch" : ""}`}>
      <input
        id={id}
        className="form-check-input"
        type={type === "radio" ? "radio" : "checkbox"}
        checked={checked}
        disabled={disabled}
        onChange={(ev) => {
          onChange?.(ev.target.checked);
        }}
        role={type === "switch" ? "switch" : undefined}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
