import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CourseMemberEntity } from "/imports/api/courses/courses";
import { RoleEntity } from "/imports/api/roles/roles";
import { useUserId } from "/imports/utils/react-meteor-data";

import { hasRoleUser } from "/imports/utils/course-role-utils";

export function Role(data: {
  selected: string[];
  role: RoleEntity;
  members: CourseMemberEntity[];
  onRole: (checked: boolean, role: string) => void;
  onEnroll: (checked: boolean, role: string) => void;
}) {
  const [checked, setChecked] = useState(data.selected?.includes(data.role.type) || false);
  const userId = useUserId();
  const { t } = useTranslation();

  function roleDescription() {
    return `roles.${data.role.type}.description`;
  }
  function roleSubscription() {
    return `roles.${data.role.type}.subscribe`;
  }
  function hasRole() {
    return data.members && hasRoleUser(data.members, data.role.type, userId);
  }

  return (
    <>
      <div className="form-check">
        <input
          className={`form-check-input js-check-role ${data.role.type}`}
          name={data.role.type}
          type="checkbox"
          value=""
          id={`courseEditRole${data.role.type}Check`}
          checked={checked}
          onChange={(event) => {
            setChecked(event.currentTarget.checked);
            data.onRole(event.currentTarget.checked, data.role.type);
          }}
        />
        <label
          className={`form-check-label ${data.role.type}`}
          htmlFor={`courseEditRole${data.role.type}Check`}
        >
          <span className={`${data.role.icon} fa-fw`} aria-hidden="true"></span>

          {t(roleDescription())}
        </label>
      </div>
      {checked ? (
        <div className="form-check ms-4">
          <input
            className={`form-check-input js-check-enroll ${data.role.type}`}
            name={data.role.type}
            type="checkbox"
            id={`courseEditRole${data.role.type}EnrollCheck`}
            checked={hasRole()}
            onChange={(event) => {
              data.onEnroll(event.currentTarget.checked, data.role.type);
            }}
          />
          <label
            className="form-check-label"
            htmlFor={`courseEditRole${data.role.type}EnrollCheck`}
          >
            {t(roleSubscription())}
          </label>
        </div>
      ) : null}
    </>
  );
}

import "./template.html";
