import React from "react";
import { useUserId } from "/imports/utils/react-meteor-data";
import { Roles as RolesEntities } from "/imports/api/roles/roles";
import { GroupMemberEntity, GroupModel } from "/imports/api/courses/courses";

import { Role } from "./role";

function loadRoles(userId: string | null, group: GroupModel, member?: GroupMemberEntity) {
  return RolesEntities.filter((r) => group.roles?.includes(r.type)).map((r) => ({
    role: r,
    subscribed: group.userHasRole(userId, r.type),
    comment: member?.comment,
    group,
  }));
}

export function Roles({ group }: { group: GroupModel }) {
  const userId = useUserId();

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
