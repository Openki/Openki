import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseMemberEntity } from "/imports/api/courses/courses";

import * as Tooltips from "/imports/utils/Tooltips";

import "./styles.scss";

export interface Props {
  member: CourseMemberEntity;
  onClick: () => void;
}

export function RemoveFromTeamDropdown({ member, onClick }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  function isNotPriviledgedSelf() {
    const notPriviledgedUser = !user?.privileged("admin");
    return member.user === user?._id && notPriviledgedUser;
  }

  return (
    <span className="dropdown" data-bs-title={t("course.roles.removeTeam", "Remove from team")}>
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
          {isNotPriviledgedSelf()
            ? t("course.details.removeTeam.self.header", "Remove yourself from the team")
            : t("course.details.removeTeam.others.header", "Remove member from the team")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="dialog-dropdown-text">
          {isNotPriviledgedSelf()
            ? t(
                "course.detail.remove.yourself.team",
                "Remove yourself from the team? Only another member can add you back.",
              )
            : t("course.detail.remove.other.team", "Remove this member from the team?")}
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
            {t("course.organizationList.remove", "Remove")}
          </button>
        </li>
      </ul>
    </span>
  );
}
