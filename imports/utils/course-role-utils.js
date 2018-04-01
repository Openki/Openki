import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

/** @summary Determine whether there is a member with the given role
  * @param members list of members
  * @param role role key
  * @return true if there is a member with the given role, and false otherwise.
  */
export function HasRole(members, role) {
	if (!members) return false;
	return members.some(function(member) {
		return member.roles.indexOf(role) !== -1;
	});
}

/** @summary Determine whether a given user has a given role in a members list
  * @param members list of members
  * @param role role key
  * @param userId user ID to check
  * @return whether the user has this role
  */
export function HasRoleUser(members, role, userId) {
	var matchRole = function(member) {
		return member.user == userId
		    && member.roles.indexOf(role) !== -1;
	};

	return members.some(matchRole);
}

export function MaySubscribe(operatorId, course, userId, role) {
	if (!userId) return false;

	// Do not allow subscribing when already subscribed
	if (HasRoleUser(course.members, role, userId)) return false;

	// Admins may do anything
	if (UserPrivilegeUtils.privileged(operatorId, 'admin')) {
		return true;
	}

	// The team role is restricted
	if ('team' === role) {
		// If there are no team-members, anybody can join
		if (!HasRole(course.members, 'team')) {
			return operatorId === userId;
		}

		// Only members of the team can take-on other people
		if (HasRoleUser(course.members, 'team', operatorId)) {
			// Only participating users can be drafted
			var candidateRoles = ['participant', 'mentor', 'host'];

			// In for a penny, in for a pound
			for (var p in candidateRoles) {
				if (HasRoleUser(course.members, candidateRoles[p], userId)) return true;
			}
		}
		return false;
	}

	// The other roles can only be chosen by the users themselves
	if (operatorId !== userId) return false;

	return true;
}

export function MayUnsubscribe(operatorId, course, userId, role) {
	if (!userId) return false;

	// Do not allow unsubscribing when not subscribed
	if (!HasRoleUser(course.members, role, userId)) return false;

	// Admins may do anything
	if (UserPrivilegeUtils.privileged(operatorId, 'admin')) {
		return true;
	}

	// The team role is restricted
	if ('team' === role) {

		// Only members of the team can take-out other people
		return HasRoleUser(course.members, 'team', operatorId);
	}

	// The other roles can only be chosen by the users themselves
	return operatorId === userId;
}
