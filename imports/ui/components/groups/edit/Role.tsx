import React from "react";
import { useTranslation } from "react-i18next";
import { FormCheck } from "/imports/ui/components/FormCheck";

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
    return `roles:${props.type}.description`;
  }
  function roleSubscription() {
    return `roles:${props.type}.subscribe`;
  }

  return (
    <>
      <FormCheck
        id={`groupEditRole${props.type}Check`}
        type="box"
        label={
          <>
            <i className={`${props.icon} fa-fw`} /> {t(roleDescription())}
          </>
        }
        checked={props.enabled}
        onChange={(checked) => props.onRole(checked)}
      />

      {props.enabled && (
        <div className="ms-4">
          <FormCheck
            id={`groupEditRole${props.type}EnrollCheck`}
            type="box"
            label={t(roleSubscription())}
            checked={props.enroll}
            onChange={(checked) => props.onEnroll(checked)}
          />
        </div>
      )}
    </>
  );
}
