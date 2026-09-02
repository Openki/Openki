import { GroupMember } from "/imports/api/groups/groups";

/**
 * Determine whether there is a member with the given role
 * @param  members list of members
 * @param roleId role key
 * @return true if there is a member with the given role, and false otherwise.
 */
export function hasRole(members: GroupMember[] | undefined, roleId: string | undefined) {
  if (!members) {
    return false;
  }
  if (!roleId) {
    return false;
  }
  return members.some((member) => member.roles.includes(roleId));
}

/**
 * Determine whether a given user has a given role in a members list
 * @param  members list of members
 * @param roleId role key
 * @param userId user ID to check
 * @return whether the user has this role
 */
export function hasRoleUser(
  members: GroupMember[],
  roleId: string,
  userId: string | undefined | null,
) {
  if (!userId) {
    return false;
  }
  return members.some((member) => member.user === userId && member.roles.includes(roleId));
}

export function hasCustomRoleUser(
  members: GroupMember[],
  roleId: string,
  userId: string | undefined | null,
) {
  if (!userId) {
    return false;
  }
  return members.some((member) => member.user === userId && member.customRoles?.includes(roleId));
}
