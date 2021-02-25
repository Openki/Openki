import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import IdTools from '/imports/utils/id-tools';

// ======== DB-Model: ========
/**
 * @typedef {Object} UserEntity
 * @property {string} [_id] ID
 * @property {Date} [createdAt]
 * @property {object} [services]
 * @property {object} [services.password]
 * @property {string} [services.password.bcrypt]
 * @property {object} [services.github]
 * @property {number} [services.github.id] Int32
 * @property {string} [services.github.accessToken]
 * @property {string|null} [services.github.email]
 * @property {string} [services.github.username]
 * @property {object} [services.facebook]
 * @property {string} [services.facebook.accessTocken]
 * @property {number} [services.facebook.expiresAt] Double
 * @property {string} [services.facebook.id]
 * @property {string} [services.facebook.email] (not allways)
 * @property {string} [services.facebook.name]
 * @property {string} [services.facebook.first_name]
 * @property {string} [services.facebook.last_name]
 * @property {string} [services.facebook.link]
 * @property {string} [services.facebook.gender]
 * @property {string} [services.facebook.locale]  ex: de_DE, en_US
 * @property {object} [services.google]
 * @property {string} [services.google.accessTocken]
 * @property {string} [services.google.idTocken]
 * @property {number} [services.google.expiresAt] Double
 * @property {string} [services.google.id]
 * @property {string} [services.google.email]
 * @property {boolean} [services.google.verified_email]
 * @property {string} [services.google.name]
 * @property {string} [services.google.given_name]
 * @property {string} [services.google.family_name]
 * @property {string} [services.google.picture] (link)
 * @property {string} [services.google.locale] ex: de
 * @property {string[]} [services.google.scope] [https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile]
 * @property {object} [services.resume]
 * @property {{when: Date, hashed: string}[]} [services.resume.loginTockens]
 * @property {string} [username]
 * @property {{address: string, verified: Boolean}[]} [emails]
 * @property {{name: string, regionId: string}} [profile]
 * @property {string[]} [privileges] [admin]
 * @property {Date} [lastLogin]
 * @property {string} [locale] This value is managed by the messageformat package
 * @property {boolean} [notifications] True if the user wants automated notification mails sent to
 * them
 * @property {boolean} [allowPrivateMessages] True if the user wants private messages mails sent
 * to them from other users
 * @property {boolean} [hidePricePolicy]
 * @property {string} [description]
 * @property {number} [avatar.color]
 * @property {string[]} [badges] (calculated) union of user's id and group ids for permission
 * checking, calculated by updateBadges()
 * @property {string[]} [groups] (calculated) List of groups the user is a member of, calculated by
 * updateBadges()
 * @property {boolean} [acceptsPrivateMessages] (calculated) true if user has email address and the
 * allowPrivateMessages flag is true. This is visible to other users.
 */

/** @typedef {User & UserEntity & import("meteor/meteor").Meteor.User} UserModel */

/** @typedef {import('../groups/groups').GroupEntity} GroupEntity */

export const User = function () { };

const Users = Meteor.users;

/** Get the current user
  *
  * If the user is not logged-in, a placeholder "anon" object is
  * returned.
  * @this {UserModel & {anon?: true}}
  */
Users.currentUser = function () {
	const logged = Meteor.user();
	if (logged) {
		return logged;
	}

	/** @type {UserModel & {anon?: true}} */
	const anon = new User();
	anon._id = 'anon';
	anon.anon = true;
	return anon;
};

/** Check whether the user may promote things with the given group.
  * The user must be a member of the group to be allowed to promote things with it.
  *
  * @this {UserModel}
  * @param {String|GroupEntity} group - The group to check, this may be an Id or a group object
  */
User.prototype.mayPromoteWith = function (group) {
	const groupId = IdTools.extract(group);
	if (!groupId || !this.groups) {
		return false;
	}
	return this.groups.indexOf(groupId) >= 0;
};

/** Get email address of user
 *
  * @this {UserModel}
  * @returns String with email address or Boolean false
  */
User.prototype.emailAddress = function () {
	return this.emails?.[0]?.address || false;
};

/** Get verified email address of user
  *
  * @this {UserModel}
  * @returns String with verified email address or Boolean false
  */
User.prototype.verifiedEmailAddress = function () {
	const emailRecord = this.emails?.[0];
	return (emailRecord
		&& emailRecord.verified
		&& emailRecord.address)
		|| false;
};

/**
 * @this {UserModel}
 * @param {string} role
 */
User.prototype.privileged = function (role) {
	return (this.privileges
		&& this.privileges.indexOf(role) > -1) || false;
};

/**
 * @param {UserEntity} user
 */
Meteor.users._transform = function (user) {
	return _.extend(new User(), user);
};

export default Users;
