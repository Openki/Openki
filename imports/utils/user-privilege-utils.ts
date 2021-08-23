import { Meteor } from 'meteor/meteor';

import { Role, UserModel, Users } from '/imports/api/users/users';

export function privileged(userOrUserId: UserModel | string | undefined | null, role: Role) {
	let user;
	if (typeof userOrUserId === 'string') {
		// Load user object if ID was passed
		user = Users.findOne({ _id: userOrUserId });
	} else {
		user = userOrUserId;
	}

	return user?.privileged(role) || false;
}

export function privilegedTo(privilege: Role) {
	const user = Meteor.user();
	return privileged(user, privilege);
}
