import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';

/**
 * @param {string} userId
 * @param {string} groupId
 */
export function isGroupMember(userId, groupId) {
	check(userId, String);
	check(groupId, String);
	return Groups.find({
		_id: groupId,
		members: userId,
	}, { limit: 1 }).count() > 0;
}

export default isGroupMember;
