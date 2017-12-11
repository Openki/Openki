import Groups from '/imports/api/groups/groups.js';

export default function IsGroupMember(userId, groupId) {
	check(userId, String);
	check(groupId, String);
	return Groups.find({
		_id: groupId,
		members: userId
	}).count() > 0;
}
