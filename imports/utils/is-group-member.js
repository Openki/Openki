import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';

/**
 * @param {string} userId
 * @param {string} groupId
 */
export default function IsGroupMember(userId, groupId) {
	check(userId, String);
	check(groupId, String);
	return Groups.find({
		_id: groupId,
		members: userId,
	}).count() > 0;
}
