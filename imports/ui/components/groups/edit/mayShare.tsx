import { GroupModel } from "/imports/api/groups/groups";

export function mayShare(group: GroupModel) {
  if (group.isPrivate()) {
    return false;
  }

  // only show share a group if there is a role to subscribe
  if (
    !(
      group.roles.some((r) => r !== "team") ||
      (group.roles.includes("team") && !group.members.some((m) => m.roles.includes("team")))
    )
  ) {
    return false;
  }

  return true;
}
