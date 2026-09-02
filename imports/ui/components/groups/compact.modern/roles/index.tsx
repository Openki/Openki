import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Role } from "./role";
import { hasRoleUser } from "/imports/utils/group-role-utils";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

export function Roles({ group }: { group: GroupModel }) {
  const userId = useUserId();
  const { t } = useTranslation();

  const [isLoading, regionRoles] = useRegionRoles(group.region);

  const groupRoles = regionRoles.filter((role) => group.roles?.includes(role.id));

  const hasParticipantRole = groupRoles.some((role) => role.id === "participant");

  const groupRolesWithoutParticipant = groupRoles.filter((role) => role.id !== "participant");

  const userHasOtherRole = groupRolesWithoutParticipant.some((role) =>
    hasRoleUser(group.members, role.id, userId),
  );

  if (isLoading()) {
    return null;
  }

  return (
    <div className="d-grid gap-1">
      {hasParticipantRole && !userHasOtherRole && <Role group={group} roleId="participant" />}

      {groupRolesWithoutParticipant
        .filter((role) => hasRoleUser(group.members, role.id, userId))
        .map((role) => (
          <Role key={role.id} group={group} roleId={role.id} />
        ))}

      {hasParticipantRole && hasRoleUser(group.members, "participant", userId) && (
        <>
          <h4 className="card-title mt-2">
            {t("groups.details.roles.title", "Do you want to contribute?")}
          </h4>
          {groupRolesWithoutParticipant
            .filter((role) => !hasRoleUser(group.members, role.id, userId))
            .map((role) => (
              <Role key={role.id} group={group} roleId={role.id} />
            ))}
        </>
      )}
    </div>
  );
}
