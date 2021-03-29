import { Meteor } from 'meteor/meteor';

import { Users } from '/imports/api/users/users';
/** @typedef {import('imports/api/users/users').UserModel} UserModel */

const UserPrivilegeUtils = {

	/**
	 * @param {UserModel|string|undefined|null} userOrUserId
	 * @param {string} role
	 * @returns {boolean}
	 */
	privileged(userOrUserId, role) {
		/** @type {UserModel|undefined|null} */
		let user;
		if (typeof userOrUserId === 'string' || userOrUserId instanceof String) {
			// Load user object if ID was passed
			user = Users.findOne({ _id: userOrUserId });
		} else {
			user = userOrUserId;
		}

		return user?.privileged(role) || false;
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
