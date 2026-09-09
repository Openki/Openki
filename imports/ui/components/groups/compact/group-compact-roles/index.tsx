import React from "react";

import { GroupModel, GroupRole } from "/imports/api/groups/groups";

import { hasRole, hasRoleUser } from "/imports/api/groups/lib/hasRole";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";
import { isParticipant, isPredefined } from "/imports/api/groups/lib/isRole";
import { predefinedRole } from "/imports/api/groups/lib/Role";

import { RoleIcon } from "/imports/ui/components/RoleIcon";

import "./styles.scss";

export interface Props {
  group: GroupModel;
}

export function GroupCompactRoles({ group }: Props) {
  const userId = useUserId();
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  const { groupListRoleNeeded, groupListRoleOccupied, groupListRoleOccupiedByUser } =
    useRoleDisplay(regionRoles);

  function roleStateClass(role: GroupRole) {
    if (!hasRole(group.members, role)) {
      return "needed";
    } else if (hasRoleUser(group.members, role, userId)) {
      return "occupied-by-user";
    } else {
      return "occupied";
    }
  }

  function roleStateTooltip(role: GroupRole, numberOf: number) {
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
        regionRoles
          .filter((regionRole) =>
            group.roles.some((r) => r.id === regionRole.id && isPredefined(r)),
          )
          .map((regionRole) => {
            const role = predefinedRole(regionRole.id);

            const numberOf = group.membersWithRole(role).length;

            return (
              <div
                key={role.id}
                className={cx("group-compact-role", roleStateClass(role))}
                data-bs-title={roleStateTooltip(role, numberOf)}
              >
                <RoleIcon role={role} regionId={group.region} />
                {isParticipant(role) && (
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
