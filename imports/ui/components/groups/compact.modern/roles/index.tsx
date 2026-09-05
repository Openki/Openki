import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Role } from "./role";
import { hasRoleUser } from "/imports/api/groups/lib/hasRole";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { SystemRoles } from "/imports/api/groups/lib/Role";
import { isParticipant, isPredefined } from "/imports/api/groups/lib/isRole";

export function Roles({ group }: { group: GroupModel }) {
  const userId = useUserId();
  const { t } = useTranslation();

  const [isLoading, regionRoles] = useRegionRoles(group.region);

  const groupRoles = group.roles.filter(
    (role) =>
      !isPredefined(role) ||
      /* every predefined role should exist in the region's roles */
      regionRoles.some((r) => r.id === role.id),
  );

  const hasParticipantRole = groupRoles.some(isParticipant);

  const groupRolesWithoutParticipant = groupRoles.filter((role) => !isParticipant(role));

  const userHasOtherRole = groupRolesWithoutParticipant.some((role) =>
    hasRoleUser(group.members, role, userId),
  );

  if (isLoading()) {
    return null;
  }

  return (
    <div className="d-grid gap-1">
      {hasParticipantRole && !userHasOtherRole && (
        <Role group={group} role={SystemRoles.Participant} />
      )}

      {groupRolesWithoutParticipant
        .filter((role) => hasRoleUser(group.members, role, userId))
        .map((role) => (
          <Role key={role.id} group={group} role={role} />
        ))}

      {hasParticipantRole && hasRoleUser(group.members, SystemRoles.Participant, userId) && (
        <>
          <h4 className="card-title mt-2">
            {t("groups.details.roles.title", "Do you want to contribute?")}
          </h4>
          {groupRolesWithoutParticipant
            .filter((role) => !hasRoleUser(group.members, role, userId))
            .map((role) => (
              <Role key={role.id} group={group} role={role} />
            ))}
        </>
      )}
    </div>
  );
}
