import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Role } from "./role";

export function Roles({ group }: { group: GroupModel }) {
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  if (isLoading()) {
    return null;
  }

  return (
    <div id="subscribe">
      {regionRoles
        .filter((role) => group.roles?.includes(role.type))
        .map((role) => (
          <Role key={role.type} group={group} roleType={role.type} />
        ))}
    </div>
  );
}
