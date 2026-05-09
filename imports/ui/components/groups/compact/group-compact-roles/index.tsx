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
    .reduce(
      (tooltips, { type }) => {
        const numberOf = group.members.filter((member) => member.roles.includes(type)).length;
        tooltips[type] = {
          needed: groupListRoleNeeded(type),
          occupied: groupListRoleOccupied(type, { NUM: numberOf }),
          occupiedByUser: groupListRoleOccupiedByUser(type, { NUM: numberOf }),
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
      {group.roles.map((role) => (
        <div
          key={role}
          className={cx("group-compact-role", roleStateClass(role))}
          data-bs-title={roleStateTooltip(role)}
        >
          <RoleIcon type={role} regionId={group.region} />

          {role === "participant" && (
            <>
              &nbsp;
              {group.members.filter((member) => member.roles.includes(role)).length}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
