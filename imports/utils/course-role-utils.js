/**
 * Determine whether there is a member with the given role
 * @param {object[]} members list of members
 * @param {string} role role key
 * @return true if there is a member with the given role, and false otherwise.
 */
export function HasRole(members, role) {
	if (!members) {
		return false;
	}
	return members.some((member) => member.roles.indexOf(role) !== -1);
}

/**
 * Determine whether a given user has a given role in a members list
 * @param {object[]} members list of members
 * @param {string} role role key
 * @param {string} userId user ID to check
 * @return whether the user has this role
 */
export function HasRoleUser(members, role, userId) {
	const matchRole = function (member) {
		return member.user === userId
			&& member.roles.indexOf(role) !== -1;
	};

	return members.some(matchRole);
}
