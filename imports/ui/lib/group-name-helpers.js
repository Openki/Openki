import { mf } from 'meteor/msgfmt:core';
import { Meteor } from 'meteor/meteor';

import { Groups } from '/imports/api/groups/groups';

function subbedGroup(group) {
	// Strings can't be context objects to Blaze templates so they get turned
	// into a String-like. Here we coerce it back if it isn't a string.
	const groupId = `${group}`;
	Meteor.subscribe('group', groupId);
	return Groups.findOne(groupId);
}

const GroupNameHelpers = {
	short() {
		if (!this) {
			return false;
		}
		const group = subbedGroup(this);
		if (!group) {
			return '-';
		}
		return group.short;
	},
	name() {
		if (!this) {
			return false;
		}
		const group = subbedGroup(this);
		if (!group) {
			return mf('group.missing', 'Group does not exist');
		}
		return group.name;
	},
};

export default GroupNameHelpers;
