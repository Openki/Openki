import { Meteor } from 'meteor/meteor';

const UserPrivilegeUtils = {
	privileged(user, role) {
		// Load user object if ID was passed
		let userObject = user;
		if (typeof user === 'string' || user instanceof String) {
			userObject = Meteor.users.findOne({ _id: user });
		}

		return userObject?.privileged(role);
	},

	privilegedTo(privilege) {
		const user = Meteor.user();
		return this.privileged(user, privilege);
	},
};

export default UserPrivilegeUtils;
