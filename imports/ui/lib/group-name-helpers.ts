import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';

import { Groups } from '/imports/api/groups/groups';

function subbedGroup(groupId: string) {
	Template.instance().subscribe('group', groupId);
	return Groups.findOne(groupId);
}

export const GroupNameHelpers = {
	short(groupId: string) {
		if (!groupId) {
			return false;
		}
		const group = subbedGroup(groupId);
		if (!group) {
			return '-';
		}
		return group.short;
	},
	name(groupId: string) {
		if (!groupId) {
			return false;
		}
		const group = subbedGroup(groupId);
		if (!group) {
			return i18n('group.missing', 'Group does not exist');
		}
		return group.name;
	},
};

export default GroupNameHelpers;
