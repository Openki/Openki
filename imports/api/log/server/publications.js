import { Meteor } from 'meteor/meteor';

import { Log } from '/imports/api/log/log';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('log', function (filter, limit) {
	// Non-admins get an empty list
	if (!UserPrivilegeUtils.privileged(this.userId, 'admin')) {
		return [];
	}

	return Log.findFilter(filter, limit);
});
