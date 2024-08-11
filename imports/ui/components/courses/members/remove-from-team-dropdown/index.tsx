import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseMemberEntity } from "/imports/api/courses/courses";

import * as Tooltips from "/imports/utils/Tooltips";

import "./styles.scss";

export type Props = {
  member: CourseMemberEntity;
  onClick: () => void;
};

export function RemoveFromTeamDropdown({ member, onClick }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  function isNotPriviledgedSelf() {
    const notPriviledgedUser = !user?.privileged("admin");
    return member.user === user?._id && notPriviledgedUser;
  }

  return (
    <span
      className="dropdown"
      data-bs-toggle="tooltip"
      data-bs-title={t("course.roles.removeTeam", "Remove from team")}
    >
      <button
        type="button"
        className="btn btn-sm btn-close btn-close-white"
        aria-expanded="false"
        data-bs-toggle="dropdown"
      ></button>
      <ul className="dropdown-menu dialog-dropdown right">
        <li className="dropdown-header">
          {isNotPriviledgedSelf()
            ? t("course.details.removeTeam.self.header", "Remove yourself from the team")
            : t("course.details.removeTeam.others.header", "Remove member from the team")}
          <button type="button" className="btn-close btn-close-white"></button>
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
              Tooltips.hide();
              onClick();
            }}
          >
            {t("course.group.remove", "Remove")}
          </button>
        </li>
      </ul>
    </span>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("RemoveFromTeamDropdown", () => RemoveFromTeamDropdown);
