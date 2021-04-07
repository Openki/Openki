import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Users } from '/imports/api/users/users';

import UserSearchPrefix from '/imports/utils/user-search-prefix';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('user', function (userId) {
	// Public fields from users
	const fields = {
		username: 1,
		description: 1,
		acceptsPrivateMessages: 1,
		'avatar.color': 1,
	};

	// Admins may see other's privileges
	if (UserPrivilegeUtils.privileged(this.userId, 'admin')) {
		fields.privileges = 1;
	}

	return Users.find(
		{ _id: userId },
		{ fields },
	);
});


// Always publish their own data for logged-in users
// https://github.com/meteor/guide/issues/651
Meteor.publish(null, function () {
	return Users.find(this.userId);
});

Meteor.publish('userSearch', (search) => {
	check(search, String);
	return UserSearchPrefix(search, { fields: { username: 1 }, limit: 10 });
});
