import React from "react";
import { useTranslation } from "react-i18next";

export interface Props {
  type: string;
  icon: string;
  enabled: boolean;
  enroll: boolean;
  onRole: (checked: boolean) => void;
  onEnroll: (checked: boolean) => void;
}

export function Role(props: Props) {
  const { t } = useTranslation();

  function roleDescription() {
    return `roles.${props.type}.description`;
  }
  function roleSubscription() {
    return `roles.${props.type}.subscribe`;
  }

  return (
    <>
      <div className="form-check">
        <input
          className={`form-check-input ${props.type}`}
          name={props.type}
          type="checkbox"
          value=""
          id={`courseEditRole${props.type}Check`}
          checked={props.enabled}
          onChange={(event) => props.onRole(event.currentTarget.checked)}
        />
        <label
          className={`form-check-label ${props.type}`}
          htmlFor={`courseEditRole${props.type}Check`}
        >
          <i className={`${props.icon} fa-fw`} /> {t(roleDescription())}
        </label>
      </div>
      {props.enabled && (
        <div className="form-check ms-4">
          <input
            className={`form-check-input ${props.type}`}
            name={props.type}
            type="checkbox"
            id={`courseEditRole${props.type}EnrollCheck`}
            checked={props.enroll}
            onChange={(event) => props.onEnroll(event.currentTarget.checked)}
          />
          <label className="form-check-label" htmlFor={`courseEditRole${props.type}EnrollCheck`}>
            {t(roleSubscription())}
          </label>
        </div>
      )}
    </>
  );
}
