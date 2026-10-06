import React from "react";
import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";

interface Props {
  group: GroupModel;
  roleId: GroupRole["id"];
}

export function GroupRoleChat({ group, roleId }: Props) {
  // TODO: Load translations for the role
  return (
    <>
      Group {group.name} role chat for {roleId}
    </>
  );
}
