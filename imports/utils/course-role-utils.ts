import { CourseMemberEntity } from "../api/courses/courses";

/**
 * Determine whether there is a member with the given role
 * @param  members list of members
 * @param role role key
 * @return true if there is a member with the given role, and false otherwise.
 */
export function hasRole(members: CourseMemberEntity[] | undefined, role: string | undefined) {
	if (!members) {
		return false;
	}
	if (!role) {
		return false;
	}
	return members.some((member) => member.roles.includes(role));
}

/**
 * Determine whether a given user has a given role in a members list
 * @param  members list of members
 * @param role role key
 * @param userId user ID to check
 * @return whether the user has this role
 */
export function hasRoleUser(
	members: CourseMemberEntity[],
	role: string,
	userId: string | undefined | null,
) {
	if (!userId) {
		return false;
	}
	return members.some((member) => member.user === userId && member.roles.includes(role));
}
