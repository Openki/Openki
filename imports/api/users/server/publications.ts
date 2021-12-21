import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Users } from '/imports/api/users/users';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('user', function (userId: string) {
	// Public fields from users
	const fields: Mongo.FieldSpecifier = {
		username: 1,
		description: 1,
		acceptsPrivateMessages: 1,
		contribution: 1,
		'avatar.color': 1,
	};

	// Admins may see other's privileges
	if (UserPrivilegeUtils.privileged(this.userId, 'admin')) {
		fields.privileges = 1;
	}

	return Users.find({ _id: userId }, { fields });
});

// Always publish their own data for logged-in users
// https://github.com/meteor/guide/issues/651
Meteor.publish(null, function () {
	return Users.find(this.userId as any);
});

Meteor.publish('userSearch', (search) => {
	check(search, String);
	return userSearchPrefix(search, { fields: { username: 1 }, limit: 10 });
});
