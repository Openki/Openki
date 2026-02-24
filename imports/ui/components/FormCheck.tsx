import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ToggleTip } from "/imports/ui/components/ToggleTip";

interface CommonProps {
  id: string;
  label: ReactNode;
  /** *Hint: Do not use for informtations that are necessary for a user to complete a task* */
  additionalInformation?: string | undefined;
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

export function FormCheck(props: Props) {
  const { id, type, label, additionalInformation, disabled, checked, onChange } = props;
  const { t } = useTranslation();

  return (
    <div className={`form-check${type === "switch" ? " form-switch" : ""}`}>
      <input
        id={id}
        name={"name" in props ? props.name : undefined}
        className="form-check-input"
        type={type === "radio" ? "radio" : "checkbox"}
        checked={checked}
        disabled={disabled}
        onChange={(ev) => onChange?.(ev.target.checked)}
        role={type === "switch" ? "switch" : undefined}
        aria-describedby={additionalInformation ? `${id}-additional-information` : undefined}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>{" "}
      {!!additionalInformation && (
        <>
          <span id={`${id}-additional-information`} hidden>
            {t("_inputField.additional-information.screenreaderHint", "Additional info beside.")}
          </span>
          <ToggleTip
            label={t("_inputField.additional-information.label", "Show additional info")}
            title={additionalInformation}
          />
        </>
      )}
    </div>
  );
}
