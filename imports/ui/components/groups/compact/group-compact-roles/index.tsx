import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "../../../../../api/groups/groups";
import { RoleEntity } from "/imports/api/regions/regions";

import { hasRole, hasRoleUser } from "../../../../../utils/group-role-utils";
import { useUserId } from "/imports/utils/react-meteor-data";

import { RoleIcon } from "../../../RoleIcon";

import "./styles.scss";

export interface Props {
  group: GroupModel;
}

export function GroupCompactRoles({ group }: Props) {
  const userId = useUserId();
  const { t } = useTranslation();

  function participantClass() {
    const { members } = group;

    if (hasRoleUser(members, "participant", userId)) {
      return "group-compact-role-occupied-by-user";
    }

    if (members.length) {
      return "group-compact-role-occupied";
    }

    return "group-compact-role-needed";
  }

  function participantTooltip() {
    let tooltip;
    const numMembers = group.interested;
    const isParticipant = hasRoleUser(group.members, "participant", userId);

    if (numMembers === 1 && isParticipant) {
      tooltip = t("group.compact.youAreInterested", "You are interested");
    } else {
      tooltip = t(
        "group.compact.interestedCount",
        "{NUM, plural, =0{Nobody is} one{One person is} other{# persons are} } interested",
        { NUM: numMembers },
      );

      if (numMembers > 1 && isParticipant) {
        tooltip += " ";
        tooltip += t("group.compact.interestedCountOwn", "and you are one of them");
      }
    }

    return tooltip;
  }

  function roleStateClass(role: string) {
    let className = "group-compact-role-";
    if (!hasRole(group.members, role)) {
      className += "needed";
    } else if (hasRoleUser(group.members, role, userId)) {
      className += "occupied-by-user";
    } else {
      className += "occupied";
    }

    return className;
  }

  function roleStateTooltip(role: RoleEntity["type"]) {
    let tooltip;

    const tooltips: Record<
      string,
      | {
          needed: string;
          occupied: string;
          occupiedByUser: string;
        }
      | undefined
    > = {
      team: {
        needed: t("group.list.status_titles.needs_team", "Needs a coordination-team"),
        occupied: t("group.list.status_titles.has_team", "Has a coordination-team"),
        occupiedByUser: t(
          "group.list.status_titles.u_are_team",
          "You are part of the coordination-team",
        ),
      },
      mentor: {
        needed: t("group.list.status_titles.needs_mentor", "Needs a mentor"),
        occupied: t("group.list.status_titles.has_mentor", "Has a mentor"),
        occupiedByUser: t("group.list.status_titles.u_are_mentor", "You are mentor"),
      },
      host: {
        needed: t("group.list.status_titles.needs_host", "Needs a host"),
        occupied: t("group.list.status_titles.has_host", "Has a host"),
        occupiedByUser: t("group.list.status_titles.u_are_host", "You are host"),
      },
    };

    if (!hasRole(group.members, role)) {
      tooltip = tooltips[role]?.needed;
    } else if (hasRoleUser(group.members, role, userId)) {
      tooltip = tooltips[role]?.occupiedByUser;
    } else {
      tooltip = tooltips[role]?.occupied;
    }

    return tooltip;
  }

  return (
    <div className="group-compact-roles col">
      {group.roles
        .filter((r) => r !== "participant")
        .map((r) => (
          <div
            key={r}
            className={`group-compact-role ${roleStateClass(r)}`}
            data-bs-title={`${roleStateTooltip(r)}`}
          >
            <RoleIcon type={r} regionId={group.region} />
          </div>
        ))}

      {group.roles.includes("participant") && (
        <div
          className={`group-compact-role ${participantClass()}`}
          data-bs-title={`${participantTooltip()}`}
        >
          <RoleIcon type="participant" regionId={group.region} />
          &nbsp;
          {group.members.filter((m) => m.roles.includes("participant")).length}
        </div>
      )}
    </div>
  );
}
