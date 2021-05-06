import { Meteor } from 'meteor/meteor';

import { Users } from '/imports/api/users/users';
/** @typedef {import('imports/api/users/users').UserModel} UserModel */

/**
 * @param {UserModel|string|undefined|null} userOrUserId
 * @param {string} role
 * @returns {boolean}
 */
export function privileged(userOrUserId, role) {
	/** @type {UserModel|undefined|null} */
	let user;
	if (typeof userOrUserId === 'string' || userOrUserId instanceof String) {
		// Load user object if ID was passed
		user = Users.findOne({ _id: userOrUserId });
	} else {
		user = userOrUserId;
	}

	return user?.privileged(role) || false;
}

/**
 * @param {string} privilege
 */
export function privilegedTo(privilege) {
	const user = Meteor.user();
	return privileged(user, privilege);
}
