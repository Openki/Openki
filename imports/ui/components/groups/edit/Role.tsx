import React from "react";
import { useTranslation } from "react-i18next";

import { getRoleDisplay } from "/imports/utils/getRoleDisplay";

import { FormCheck } from "/imports/ui/components/FormCheck";

export interface Props {
  type: string;
  icon: string;
  enabled: boolean;
  enroll: boolean;
  onRole: (checked: boolean) => void;
  onEnroll: (checked: boolean) => void;
}

export function Role({ type, icon, enabled, enroll, onRole, onEnroll }: Props) {
  const { t } = useTranslation();
  const { roleDescription, roleSubscribe } = getRoleDisplay(t);

  return (
    <>
      <FormCheck
        id={`groupEditRole${type}Check`}
        type="box"
        label={
          <>
            <i className={`${icon} fa-fw`} /> {roleDescription(type)}
          </>
        }
        checked={enabled}
        onChange={(checked) => onRole(checked)}
      />

      {enabled && (
        <div className="ms-4">
          <FormCheck
            id={`groupEditRole${type}EnrollCheck`}
            type="box"
            label={roleSubscribe(type)}
            checked={enroll}
            onChange={(checked) => onEnroll(checked)}
          />
        </div>
      )}
    </>
  );
}
