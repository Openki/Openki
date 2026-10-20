import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "../../../../hooks/useRegionRoles";

import { Role } from "./role";
import { hasRoleUser } from "/imports/api/groups/lib/hasRole";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useTranslation } from "react-i18next";
import { SystemRoles } from "/imports/api/groups/lib/Role";
import { isParticipant, isPredefined, isTeam } from "/imports/api/groups/lib/isRole";
import { isTeamRoleVisible } from "/imports/api/groups/lib/teamPermissions";

export function Roles({ group }: { group: GroupModel }) {
  const { t } = useTranslation();
  const user = useUser();
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  const groupRoles = group.roles
    /* Show custom roles and predefined roles that exists in the region's roles */
    .filter((role) => !isPredefined(role) || regionRoles.some((r) => r.id === role.id))
    /* Team role has special conditions to be visible */
    .filter((role) => !isTeam(role) || isTeamRoleVisible(group, user));

  const hasParticipantRole = groupRoles.some(isParticipant);

  const groupRolesWithoutParticipant = groupRoles.filter((role) => !isParticipant(role));

  const userRoles = groupRolesWithoutParticipant.filter(
    (role) => !hasRoleUser(group.members, role, user?._id),
  );

  const userHasOtherRole = groupRolesWithoutParticipant.some((role) =>
    hasRoleUser(group.members, role, user?._id),
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
        .filter((role) => hasRoleUser(group.members, role, user?._id))
        .map((role) => (
          <Role key={role.id} group={group} role={role} />
        ))}

      {hasParticipantRole &&
        hasRoleUser(group.members, SystemRoles.Participant, user?._id) &&
        userRoles.length > 0 && (
          <>
            <h4 className="card-title mt-2">
              {t("groups.details.roles.title", "Do you want to contribute?")}
            </h4>
            {userRoles.map((role) => (
              <Role key={role.id} group={group} role={role} />
            ))}
          </>
        )}
    </div>
  );
}
