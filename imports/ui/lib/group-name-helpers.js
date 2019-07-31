import Groups from '/imports/api/groups/groups';

function subbedGroup(group) {
	// Strings can't be context objects to Blaze templates so they get turned
	// into a String-like. Here we coerce it back if it isn't a string.
	const groupId = `${group}`;
	Meteor.subscribe('group', groupId);
	return Groups.findOne(groupId);
}

const GroupNameHelpers = {
	short() {
		if (!this) return;
		const group = subbedGroup(this);
		// eslint-disable-next-line consistent-return
		if (!group) return '-';
		// eslint-disable-next-line consistent-return
		return group.short;
	},
	name() {
		if (!this) return;
		const group = subbedGroup(this);
		// eslint-disable-next-line consistent-return
		if (!group) return mf('group.missing', 'Group does not exist');
		// eslint-disable-next-line consistent-return
		return group.name;
	},
};

export default GroupNameHelpers;
