import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { isPredefined } from "/imports/api/groups/lib/isRole";

import { Role } from "./role";

export function Roles({ group }: { group: GroupModel }) {
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  if (isLoading()) {
    return null;
  }

  return (
    <div id="subscribe">
      {group.roles
        /* every predefined role should exist in the region's roles */
        .filter((role) => !isPredefined(role) || regionRoles.some((r) => r.id === role.id))
        .map((role) => (
          <Role key={role.id} group={group} role={role} />
        ))}
    </div>
  );
}
