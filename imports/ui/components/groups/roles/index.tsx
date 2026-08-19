import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { CustomRole } from "./custom-role";
import { Role } from "./role";

export function Roles({ group }: { group: GroupModel }) {
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  if (isLoading()) {
    return null;
  }

  return (
    <div id="subscribe">
      {group.customRoles?.map((role) => (
        <CustomRole key={role.id} group={group} role={role} />
      ))}
      {regionRoles
        .filter((role) => group.roles?.includes(role.id))
        .map((role) => (
          <Role key={role.id} group={group} roleId={role.id} />
        ))}
    </div>
  );
}
