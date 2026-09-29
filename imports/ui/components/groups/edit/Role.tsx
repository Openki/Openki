import React from "react";

import { cx } from "/imports/utils/cx";

import { FormCheck } from "/imports/ui/components/FormCheck";

export interface Props {
  id: string;
  icon: string;
  description: string;
  subscribeLabel: string;
  enabled: boolean;
  enroll: boolean;
  onRole: (checked: boolean) => void;
  onEnroll: (checked: boolean) => void;
}

export function Role({
  id,
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
        id={`groupEditRole${id}Check`}
        type="box"
        label={
          <>
            <i className={cx(icon, "fa-fw")} /> {description}
          </>
        }
        checked={enabled}
        onChange={onRole}
      />

      {enabled && (
        <div className="ms-4">
          <FormCheck
            id={`groupEditRole${id}EnrollCheck`}
            type="box"
            label={subscribeLabel}
            checked={enroll}
            onChange={onEnroll}
          />
        </div>
      )}
    </>
  );
}
