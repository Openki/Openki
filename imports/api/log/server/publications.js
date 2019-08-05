import Log from '../log';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

// eslint-disable-next-line func-names
Meteor.publish('log', function (filter, limit) {
	// Non-admins get an empty list
	if (!UserPrivilegeUtils.privileged(this.userId, 'admin')) {
		return [];
	}

	return Log.findFilter(filter, limit);
});
