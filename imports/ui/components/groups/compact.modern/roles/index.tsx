import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Role } from "./role";
import { hasRoleUser } from "/imports/utils/group-role-utils";
import { useUserId } from "/imports/utils/react-meteor-data";

export function Roles({ group }: { group: GroupModel }) {
  const userId = useUserId();

  const [isLoading, regionRoles] = useRegionRoles(group.region);

  const groupRoles = regionRoles.filter((role) => group.roles?.includes(role.type));

  const hasParticipantRole = groupRoles.some((role) => role.type === "participant");

  const groupRolesWithoutParticipant = groupRoles.filter((role) => role.type !== "participant");

  const userHasOtherRole = groupRolesWithoutParticipant.some((role) =>
    hasRoleUser(group.members, role.type, userId),
  );

  if (isLoading()) {
    return null;
  }

  return (
    <div className="d-grid gap-1">
      {hasParticipantRole && !userHasOtherRole && <Role group={group} roleType="participant" />}

      {groupRolesWithoutParticipant
        .filter((role) => hasRoleUser(group.members, role.type, userId))
        .map((role) => (
          <Role key={role.type} group={group} roleType={role.type} />
        ))}

      {hasParticipantRole && hasRoleUser(group.members, "participant", userId) && (
        <>
          <h4 className="card-title mt-2">
            {t("groups.details.roles.title", "Do you want to contribute?")}
          </h4>
          {groupRolesWithoutParticipant
            .filter((role) => !hasRoleUser(group.members, role.type, userId))
            .map((role) => (
              <Role key={role.type} group={group} roleType={role.type} />
            ))}
        </>
      )}
    </div>
  );
}
