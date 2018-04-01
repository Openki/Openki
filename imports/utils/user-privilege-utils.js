import { Meteor } from 'meteor/meteor';

export default UserPrivilegeUtils = {
	privileged(user, privilege) {
		// Load user object if ID was passed
		if (typeof user === 'string' || user instanceof String) {
			user = Meteor.users.findOne({ _id: user });
		}

		return (
			user
			&& user.privileges
			&& user.privileges.indexOf(privilege) > -1
		);
	},

	privilegedTo(privilege) {
		var user = Meteor.user();
		return this.privileged(user, privilege);
	}
};
