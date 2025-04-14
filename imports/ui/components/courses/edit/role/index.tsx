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

export function Role(data: Props) {
  const { t } = useTranslation();

  function roleDescription() {
    return `roles.${data.type}.description`;
  }
  function roleSubscription() {
    return `roles.${data.type}.subscribe`;
  }

  return (
    <>
      <div className="form-check">
        <input
          className={`form-check-input js-check-role ${data.type}`}
          name={data.type}
          type="checkbox"
          value=""
          id={`courseEditRole${data.type}Check`}
          checked={data.enabled}
          onChange={(event) => {
            data.onRole(event.currentTarget.checked);
          }}
        />
        <label
          className={`form-check-label ${data.type}`}
          htmlFor={`courseEditRole${data.type}Check`}
        >
          <span className={`${data.icon} fa-fw`} aria-hidden="true"></span> {t(roleDescription())}
        </label>
      </div>
      {data.enabled ? (
        <div className="form-check ms-4">
          <input
            className={`form-check-input js-check-enroll ${data.type}`}
            name={data.type}
            type="checkbox"
            id={`courseEditRole${data.type}EnrollCheck`}
            checked={data.enroll}
            onChange={(event) => {
              data.onEnroll(event.currentTarget.checked);
            }}
          />
          <label className="form-check-label" htmlFor={`courseEditRole${data.type}EnrollCheck`}>
            {t(roleSubscription())}
          </label>
        </div>
      ) : null}
    </>
  );
}
