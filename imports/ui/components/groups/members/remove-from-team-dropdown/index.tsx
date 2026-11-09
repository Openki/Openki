import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { Tooltip } from "/imports/startup/client/bootstrap";

import { GroupMember } from "/imports/api/groups/groups";

import "./styles.scss";

export interface Props {
  member: GroupMember;
  onClick: () => void;
}

export function RemoveFromTeamDropdown({ member, onClick }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const tooltipRef = useRef<HTMLElement | null>(null);

  function isNotPrivilegedSelf() {
    const notPrivilegedUser = !user?.hasPrivilege("admin");
    return member.user === user?._id && notPrivilegedUser;
  }

  return (
    <span
      className="dropdown"
      data-bs-title={t("group.roles.removeTeam", "Remove from team")}
      ref={tooltipRef}
    >
      <button
        type="button"
        className="btn btn-sm btn-close"
        aria-expanded="false"
        data-bs-toggle="dropdown"
        data-bs-theme="dark"
      />
      <ul className="dropdown-menu dropdown-menu-end dialog-dropdown">
        <li className="dropdown-header">
          {isNotPrivilegedSelf()
            ? t("group.details.removeTeam.self.header", "Remove yourself from the team")
            : t("group.details.removeTeam.others.header", "Remove team member")}
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
              // Close any potentially open tooltip before letting React unmount this component.
              // This prevents a crash and lets the event handler finish as expected.
              // NOTE: When migrating away from Bootstrap, we should use a tooltip solution
              // that aligns better with the React Virtual DOM and rendering.
              if (tooltipRef.current) {
                const tooltip = Tooltip.getOrCreateInstance(tooltipRef.current);
                tooltip.dispose();
              }
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
