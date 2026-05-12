import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { hasRole, hasRoleUser } from "../../../../../utils/group-role-utils";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

export interface Props {
  group: GroupModel;
}

export function GroupCompactRoles({ group }: Props) {
  const userId = useUserId();
  const [isLoading, roles] = useRegionRoles(group.region);

  const { groupListRoleNeeded, groupListRoleOccupied, groupListRoleOccupiedByUser } =
    useRoleDisplay(roles);

  function roleStateClass(role: RoleEntity["type"]) {
    if (!hasRole(group.members, role)) {
      return "needed";
    } else if (hasRoleUser(group.members, role, userId)) {
      return "occupied-by-user";
    } else {
      return "occupied";
    }
  }

  function roleStateTooltip(role: RoleEntity["type"], numberOf: number) {
    if (!hasRole(group.members, role)) {
      return groupListRoleNeeded(role);
    } else if (hasRoleUser(group.members, role, userId)) {
      return groupListRoleOccupiedByUser(role, { NUM: numberOf });
    } else {
      return groupListRoleOccupied(role, { NUM: numberOf });
    }
  }

  return (
    <div className="group-compact-roles col">
      {!isLoading() &&
        roles
          .filter((role) => group.roles.includes(role.type))
          .map((role) => {
            const numberOf = group.members.filter((member) =>
              member.roles.includes(role.type),
            ).length;

            return (
              <div
                key={role.type}
                className={cx("group-compact-role", roleStateClass(role.type))}
                data-bs-title={roleStateTooltip(role.type, numberOf)}
              >
                <i className={cx(role.icon, "fa-fw")} />
                {role.type === "participant" && (
                  <>
                    &nbsp;
                    {numberOf}
                  </>
                )}
              </div>
            );
          })}
    </div>
  );
}
