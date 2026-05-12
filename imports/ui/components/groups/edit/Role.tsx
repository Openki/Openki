import React from "react";

import { cx } from "/imports/utils/cx";

import { FormCheck } from "/imports/ui/components/FormCheck";

export interface Props {
  type: string;
  icon: string;
  description: string;
  subscribeLabel: string;
  enabled: boolean;
  enroll: boolean;
  onRole: (checked: boolean) => void;
  onEnroll: (checked: boolean) => void;
}

export function Role({
  type,
  icon,
  description,
  subscribeLabel,
  enabled,
  enroll,
  onRole,
  onEnroll,
}: Props) {
  return (
    <>
      <FormCheck
        id={`groupEditRole${type}Check`}
        type="box"
        label={
          <>
            <i className={cx(icon, "fa-fw")} /> {description}
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
            label={subscribeLabel}
            checked={enroll}
            onChange={(checked) => onEnroll(checked)}
          />
        </div>
      )}
    </>
  );
}
