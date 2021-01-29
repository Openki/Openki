import { Meteor } from 'meteor/meteor';

/** @typedef {import('imports/api/users/users').UserModel} UserModel */

const UserPrivilegeUtils = {

	/**
	 * @param {UserModel|string} user
	 * @param {string} role
	 * @returns {boolean}
	 */
	privileged(user, role) {
		// Load user object if ID was passed
		let userObject = user;
		if (typeof user === 'string' || user instanceof String) {
			userObject = Meteor.users.findOne({ _id: user });
		}

		return userObject?.privileged(role);
	},

	/**
	 * @param {string} privilege
	 */
	privilegedTo(privilege) {
		const user = Meteor.user();
		return this.privileged(user, privilege);
	},
};

export default UserPrivilegeUtils;
