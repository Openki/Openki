import { Meteor } from 'meteor/meteor';

export default UserPrivilegeUtils = {
	privileged(user, role) {
		// Load user object if ID was passed
		if (typeof user === 'string' || user instanceof String) {
			user = Meteor.users.findOne({ _id: user });
		}

		return user && user.privileged(role); 
	},

	privilegedTo(privilege) {
		var user = Meteor.user();
		return this.privileged(user, privilege);
	}
};
