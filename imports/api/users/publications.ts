import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Users } from '/imports/api/users/users';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';
import { ServerPublish } from '/imports/utils/ServerPublish';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

if (Meteor.isServer) {
	// Always publish their own data for logged-in users
	// https://github.com/meteor/guide/issues/651
	Meteor.publish(null, function () {
		return Users.find(this.userId as any);
	});
}

export const simple = ServerPublish(
	'user.simple',
	(userId: string) => {
		check(userId, String);

		// Public fields from users
		const fields: Mongo.FieldSpecifier = { username: 1, contribution: 1 };

		return Users.find(userId, { fields });
	},
	(userId: string) => {
		// Public fields from users
		const fields: Mongo.FieldSpecifier = { username: 1, contribution: 1 };

		return Users.findOne(userId, { fields });
	},
);

export const details = ServerPublish(
	'user',
	(userId: string) => {
		check(userId, String);

		// Public fields from users
		const fields: Mongo.FieldSpecifier = {
			username: 1,
			description: 1,
			acceptsPrivateMessages: 1,
			contribution: 1,
			'avatar.color': 1,
		};

		// Admins may see other's privileges
		if (UserPrivilegeUtils.privileged(Meteor.userId(), 'admin')) {
			fields.privileges = 1;
		}

		return Users.find(userId, { fields });
	},
	(userId: string) => {
		// Public fields from users
		const fields: Mongo.FieldSpecifier = {
			username: 1,
			description: 1,
			acceptsPrivateMessages: 1,
			contribution: 1,
			'avatar.color': 1,
		};

		// Admins may see other's privileges
		if (UserPrivilegeUtils.privileged(Meteor.userId(), 'admin')) {
			fields.privileges = 1;
		}

		return Users.findOne(userId, { fields });
	},
);

export const findFilter = ServerPublish('userSearch', (search: string) => {
	check(search, String);

	return userSearchPrefix(search, { fields: { username: 1 }, limit: 10 });
});
