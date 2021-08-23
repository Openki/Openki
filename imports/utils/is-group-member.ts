import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';

export function isGroupMember(userId: string, groupId: string) {
	check(userId, String);
	check(groupId, String);
	return (
		Groups.find(
			{
				_id: groupId,
				members: userId,
			},
			{ limit: 1 },
		).count() > 0
	);
}

export default isGroupMember;
