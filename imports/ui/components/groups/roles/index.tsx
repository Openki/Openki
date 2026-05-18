import React from "react";

import { GroupMemberEntity, GroupModel } from "../../../../api/groups/groups";

import { useUserId } from "/imports/utils/react-meteor-data";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { Role } from "./role";

export function Roles({ group }: { group: GroupModel }) {
  const userId = useUserId();
  const [isLoading, regionRoles] = useRegionRoles(group.region);

  if (isLoading()) {
    return null;
  }

  function loadRoles(userId: string | null, group: GroupModel, member?: GroupMemberEntity) {
    return regionRoles
      .filter((r) => group.roles?.includes(r.type))
      .map((role) => ({
        role,
        subscribed: group.userHasRole(userId, role.type),
        comment: member?.comment,
        group,
      }));
  }

  const member = group.members?.find((m) => m.user === userId);
  const roles = loadRoles(userId, group, member);

  return (
    <div id="subscribe">
      {roles.map((role) => (
        <Role key={role.role.type} {...role} />
      ))}
    </div>
  );
}
