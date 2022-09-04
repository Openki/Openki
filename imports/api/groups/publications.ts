import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';

import { ServerPublish } from '/imports/utils/ServerPublish';

export const findFilter = ServerPublish('Groups.findFilter', (filter) => Groups.findFilter(filter));

export const details = ServerPublish(
	'group',
	(groupId: string) => {
		check(groupId, String);

		return Groups.find(groupId);
	},
	(groupId: string) => Groups.findOne(groupId),
);
