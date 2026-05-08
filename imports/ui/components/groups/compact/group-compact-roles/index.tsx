import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";
import { RoleEntity } from "/imports/api/regions/regions";

import { hasRole, hasRoleUser } from "../../../../../utils/group-role-utils";
import { getRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";
import { RoleIcon } from "../../../RoleIcon";

import "./styles.scss";

export interface Props {
  group: GroupModel;
}

export function GroupCompactRoles({ group }: Props) {
  const userId = useUserId();
  const { t } = useTranslation();
  const [isLoading, roles] = useRegionRoles();

  function participantTooltip() {
    let tooltip;
    const numberOfParticipants = group.members.filter((member) =>
      member.roles.includes("participant"),
    ).length;
    const isParticipant = hasRoleUser(group.members, "participant", userId);

    if (numberOfParticipants === 1 && isParticipant) {
      tooltip = t("group.compact.youAreInterested", "You are interested");
    } else {
      tooltip = t(
        "group.compact.interestedCount",
        "{NUM, plural, =0{Nobody is} one{One person is} other{# persons are} } interested",
        { NUM: numberOfParticipants },
      );

      if (numberOfParticipants > 1 && isParticipant) {
        tooltip += " ";
        tooltip += t("group.compact.interestedCountOwn", "and you are one of them");
      }
    }

    return tooltip;
  }

  function roleStateClass(role: string) {
    if (!hasRole(group.members, role)) {
      return "needed";
    } else if (hasRoleUser(group.members, role, userId)) {
      return "occupied-by-user";
    }
    return "occupied";
  }

  const { groupListRoleNeeded, groupListRoleOccupied, groupListRoleOccupiedByUser } =
    getRoleDisplay(t);

  if (isLoading()) {
    return null;
  }

  const tooltips = roles
    .filter((role) => role.type !== "participant")
    .reduce(
      (tooltips, { type }) => {
        tooltips[type] = {
          needed: groupListRoleNeeded(type),
          occupied: groupListRoleOccupied(type),
          occupiedByUser: groupListRoleOccupiedByUser(type),
        };

        return tooltips;
      },
      {} as Record<
        string,
        | {
            needed: string;
            occupied: string;
            occupiedByUser: string;
          }
        | undefined
      >,
    );

  function roleStateTooltip(role: RoleEntity["type"]) {
    if (!hasRole(group.members, role)) {
      return tooltips[role]?.needed;
    } else if (hasRoleUser(group.members, role, userId)) {
      return tooltips[role]?.occupiedByUser;
    } else {
      return tooltips[role]?.occupied;
    }
  }

  return (
    <div className="group-compact-roles col">
      {group.roles
        .filter((role) => role !== "participant")
        .map((role) => (
          <div
            key={role}
            className={cx("group-compact-role", roleStateClass(role))}
            data-bs-title={roleStateTooltip(role)}
          >
            <RoleIcon type={role} regionId={group.region} />
          </div>
        ))}

      {group.roles.includes("participant") && (
        <div
          className={cx("group-compact-role", roleStateClass("participant"))}
          data-bs-title={participantTooltip()}
        >
          <RoleIcon type="participant" regionId={group.region} />
          &nbsp;
          {group.members.filter((member) => member.roles.includes("participant")).length}
        </div>
      )}
    </div>
  );
}
