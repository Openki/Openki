import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';

import { Groups } from '/imports/api/groups/groups';

function subbedGroup(group: any) {
	// Strings can't be context objects to Blaze templates so they get turned
	// into a String-like. Here we coerce it back if it isn't a string.
	const groupId = `${group}`;
	Template.instance().subscribe('group', groupId);
	return Groups.findOne(groupId);
}

export const GroupNameHelpers = {
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
			return i18n('group.missing', 'Group does not exist');
		}
		return group.name;
	},
};

export default GroupNameHelpers;
