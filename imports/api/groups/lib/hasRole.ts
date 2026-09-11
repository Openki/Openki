import { type GroupMember, type GroupRoleRef } from "/imports/api/groups/groups";
import { sameRole } from "/imports/api/groups/lib/isRole";

/**
 * Determine whether there is a member with the given role
 * @param members list of members
 * @return true if there is a member with the given role, and false otherwise.
 */
export function hasRole(members: GroupMember[] | undefined, groupRole: GroupRoleRef | undefined) {
  if (!members) {
    return false;
  }
  if (!groupRole) {
    return false;
  }
  return members.some((member) =>
    member.roles.some((memberRole) => sameRole(memberRole, groupRole)),
  );
}

/**
 * Determine whether a given user has a given role in a members list
 * @param members list of members
 * @return whether the user has this role
 */
export function hasRoleUser(
  members: GroupMember[],
  groupRole: GroupRoleRef,
  userId: string | undefined | null,
) {
  if (!userId) {
    return false;
  }
  return !!members
    .find((member) => member.user === userId)
    ?.roles.some((memberRole) => sameRole(memberRole, groupRole));
}
