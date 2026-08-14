import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupMemberEntity } from "/imports/api/groups/groups";

import * as Tooltips from "/imports/utils/Tooltips";

import "./styles.scss";

export interface Props {
  member: GroupMemberEntity;
  onClick: () => void;
}

export function RemoveFromTeamDropdown({ member, onClick }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  function isNotPrivilegedSelf() {
    const notPrivilegedUser = !user?.hasPrivilege("admin");
    return member.user === user?._id && notPrivilegedUser;
  }

  return (
    <span className="dropdown" data-bs-title={t("group.roles.removeTeam", "Remove from team")}>
      <button
        type="button"
        className="btn btn-sm btn-close"
        aria-expanded="false"
        data-bs-toggle="dropdown"
        data-bs-theme="dark"
        onClick={() => {
          setTimeout(() => {
            Tooltips.hide();
          }, 0);
        }}
      ></button>
      <ul className="dropdown-menu dropdown-menu-end dialog-dropdown">
        <li className="dropdown-header">
          {isNotPrivilegedSelf()
            ? t("group.details.removeTeam.self.header", "Remove yourself from the team")
            : t("group.details.removeTeam.others.header", "Remove member from the team")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="dialog-dropdown-text">
          {isNotPrivilegedSelf()
            ? t(
                "group.detail.remove.yourself.team",
                "Remove yourself from the team? Only another member can add you back.",
              )
            : t("group.detail.remove.other.team", "Remove this member from the team?")}
        </li>
        <li className="dialog-dropdown-btn">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setTimeout(() => {
                Tooltips.hide();
              }, 0);
              onClick();
            }}
          >
            {t("group.organizationList.remove", "Remove")}
          </button>
        </li>
      </ul>
    </span>
  );
}
