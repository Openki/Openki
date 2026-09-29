import React from "react";

import { GroupModel } from "/imports/api/groups/groups";
import { isTeamRoleVisible } from "/imports/api/groups/lib/teamPermissions";
import { isPredefined, isTeam } from "/imports/api/groups/lib/isRole";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { useUser } from "/imports/utils/react-meteor-data";

import { Role } from "./role";

export function Roles({ group }: { group: GroupModel }) {
  const user = useUser();
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  if (isLoading()) {
    return null;
  }

  return (
    <div id="subscribe">
      {group.roles
        /* Show custom roles and predefined roles that exists in the region's roles */
        .filter((role) => !isPredefined(role) || regionRoles.some((r) => r.id === role.id))
        /* Team role has special conditions to be visible */
        .filter((role) => !isTeam(role) || isTeamRoleVisible(group, user))
        .map((role) => (
          <Role key={role.id} group={group} role={role} />
        ))}
    </div>
  );
}
