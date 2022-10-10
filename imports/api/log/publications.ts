import { Match, check } from 'meteor/check';

import { FindFilter } from '/imports/api/log/factory';
import { Log } from '/imports/api/log/log';

import { ServerPublish } from '/imports/utils/ServerPublish';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

export const findFilter = ServerPublish('log', (filter: FindFilter, limit: number) => {
	check(limit, Match.Integer);

	// Non-admins get an empty list
	if (!UserPrivilegeUtils.privileged(Meteor.userId(), 'admin')) {
		return [];
	}

	return Log.findFilter(filter, limit);
});
