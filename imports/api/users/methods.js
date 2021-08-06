import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { ValidationError } from 'meteor/mdg:validation-error';

import { Log } from '/imports/api/log/log';
import { Groups } from '/imports/api/groups/groups';
import { Users } from '/imports/api/users/users';
import { Courses } from '/imports/api/courses/courses';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import Profile from '/imports/utils/profile';
import { isEmail } from '/imports/utils/email-tools';
import * as StringTools from '/imports/utils/string-tools';
import { AsyncTools } from '/imports/utils/async-tools';
/** @typedef {import('/imports/api/courses/courses').Course} Course */
import { Events } from '../events/events';
import { ServerMethod } from '/imports/utils/ServerMethod';
/** @typedef {import('./users').UserModel} UserModel */

/**
 * Set user region
 */
export const regionChange = ServerMethod(
	'user.regionChange',
	/**
	 * @param {string} newRegion
	 */
	(newRegion) => {
		Profile.Region.change(Meteor.userId(), newRegion, 'client call');
	},
);

/**
 * Update user avatar color
 */
export const updateAvatarColor = ServerMethod(
	'user.updateAvatarColor',
	/**
	 * @param {number} [newColor] hsl hue number, otherwise a random color is generated
	 */
	(newColor) => {
		check(newColor, Match.Optional(Number));

		const color = newColor ?? _.random(360);
		Profile.AvatarColor.change(Meteor.userId(), color);
	},
);

/**
 * Update user description
 */
export const updateDescription = ServerMethod(
	'user.updateDescription',
	/**
	 * @param {string} description
	 */
	(description) => {
		check(description, String);

		/** @type {UserModel} */
		const user = Meteor.user();
		if (!user) {
			throw new ValidationError([{ name: 'description', type: 'plzLogin' }], 'Not logged-in');
		}

		const sane = StringTools.saneTitle(description).trim().substring(0, 400);

		const result = Profile.Description.change(user._id, sane);
		if (!result) {
			throw new ValidationError(
				[{ name: 'description', type: 'descriptionError' }],
				'Failed to update description',
			);
		}
	},
);

/**
 * Update username
 */
export const updateUsername = ServerMethod(
	'user.updateUsername',
	/**
	 * @param {string} description
	 */
	(username) => {
		check(username, String);

		/** @type {UserModel | undefined} */
		const user = Meteor.user();
		if (!user) {
			throw new ValidationError([{ name: 'username', type: 'plzLogin' }], 'Not logged-in');
		}

		const saneUsername = StringTools.saneTitle(username)
			.replace(/\u2b50/g, '')
			.trim()
			.substring(0, 200);

		if (saneUsername.length === 0) {
			throw new ValidationError(
				[{ name: 'username', type: 'noUserName' }],
				'username cannot be empty',
			);
		}

		if (saneUsername === user.username) {
			return;
		}

		if (Accounts.findUserByUsername(saneUsername)) {
			throw new ValidationError(
				[{ name: 'username', type: 'userExists' }],
				'username is already taken',
			);
		}

		const result = Profile.Username.change(user._id, saneUsername);
		if (!result) {
			throw new ValidationError(
				[{ name: 'username', type: 'nameError' }],
				'Failed to update username',
			);
		}
	},
	{ simulation: false },
);

/**
 * Update automated notification flag
 */
export const updateAutomatedNotification = ServerMethod(
	'user.updateAutomatedNotification',
	/**
	 * @param {boolean} allow
	 */
	(allow) => {
		check(allow, Boolean);

		/** @type {UserModel} */
		const user = Meteor.user();
		if (!user) {
			throw new ValidationError([{ name: 'notifications', type: 'plzLogin' }], 'Not logged-in');
		}

		if (user.notifications !== allow) {
			Profile.Notifications.change(user._id, allow, undefined, 'profile change');
		}
	},
);

/**
 * Update private messages flag
 */
export const updatePrivateMessages = ServerMethod(
	'user.updatePrivateMessages',
	/**
	 * @param {boolean} allow
	 */
	(allow) => {
		check(allow, Boolean);

		/** @type {UserModel} */
		const user = Meteor.user();
		if (!user) {
			throw new ValidationError(
				[{ name: 'allowPrivateMessages', type: 'plzLogin' }],
				'Not logged-in',
			);
		}

		if (user.allowPrivateMessages !== allow) {
			Profile.PrivateMessages.change(user._id, allow, undefined, 'profile change');
		}
	},
);

/**
 * Update email
 */
export const updateEmail = ServerMethod(
	'user.updateEmail',
	/**
	 * @param {string} email
	 */
	(email) => {
		check(email, String);

		const user = Meteor.user();
		if (!user) {
			throw new ValidationError([{ name: 'email', type: 'plzLogin' }], 'Not logged-in');
		}

		const newEmail = email.trim() || false;
		const oldEmail = user.emailAddress();

		// for users with email not yet set, we dont want to force them
		// to enter a email when they change other profile settings.
		if (newEmail === oldEmail) {
			return;
		}

		if (!newEmail) {
			throw new ValidationError([{ name: 'email', type: 'noEmail' }], 'Please enter a email.');
		}

		if (!isEmail(newEmail)) {
			throw new ValidationError([{ name: 'email', type: 'emailNotValid' }], 'email invalid');
		}

		// Don't allow using an address somebody else uses
		const existingUser = Accounts.findUserByEmail(newEmail);
		if (existingUser) {
			throw new ValidationError([{ name: 'email', type: 'emailExists' }], 'Email already exists.');
		}

		Profile.Email.change(user._id, newEmail, 'profile change');
	},
	{ simulation: false },
);

export const selfRemove = ServerMethod('user.self.remove', () => {
	const user = Meteor.user();
	if (user) {
		Users.remove({ _id: user._id });
	}
});

export const adminRemove = ServerMethod(
	'user.admin.remove',
	/**
	 * @param {string} userId
	 * @param {string} reason
	 * @param {object} [options]
	 * @param {boolean} [options.courses] On true the courses (and events) created by the user
	 * will also be deleted
	 */
	(userId, reason, options) => {
		check(userId, String);
		check(reason, String);
		check(
			options,
			Match.Optional({
				courses: Match.Optional(Boolean),
			}),
		);

		if (!UserPrivilegeUtils.privilegedTo('admin')) return;

		/** @type {Course[]} */
		const deletedCourses = [];
		let numberOfDeletedEvents = 0;
		if (options?.courses) {
			// Remove courses created by this user
			Courses.find({ createdby: userId })
				.fetch()
				.forEach((course) => {
					deletedCourses.push(course);
					numberOfDeletedEvents += Events.remove({ courseId: course._id });
				});

			Courses.remove({ createdby: userId });
		}

		// Updated courses and events he is involted
		const courses = Courses.find({ 'members.user': userId }).fetch();
		courses.forEach((course) => {
			Events.update({ courseId: course._id }, { $pull: { editors: userId } }, { multi: true });
			Events.update({ courseId: course._id }, { $pull: { participants: userId } }, { multi: true });

			Courses.update({ _id: course._id }, { $pull: { members: { user: userId } } });
			Courses.update({ _id: course._id }, { $pull: { editors: userId } });

			// Update member related calculated fields
			Courses.updateInterested(course._id);
			Courses.updateGroups(course._id);
		});

		const operatorId = Meteor.userId();
		const user = Users.findOne(userId);
		delete user.services;

		Users.remove({ _id: userId });

		Log.record('user.admin.remove', [operatorId, userId], {
			operatorId,
			reason,
			user,
			deletedCourses,
			numberOfDeletedEvents,
		});
	},
);

export const addPrivilege = ServerMethod(
	'user.addPrivilege',
	/**
	 * @param {string} userId
	 * @param {string} privilege
	 */
	(userId, privilege) => {
		// At the moment, only admins may hand out privileges, so this is easy
		if (UserPrivilegeUtils.privilegedTo('admin')) {
			const user = Users.findOne({ _id: userId });
			if (!user) {
				throw new Meteor.Error(404, 'User not found');
			}
			Users.update(
				{ _id: user._id },
				{ $addToSet: { privileges: privilege } },
				AsyncTools.checkUpdateOne,
			);
		}
	},
);

export const removePrivilege = ServerMethod(
	'user.removePrivilege',
	/**
	 * @param {string} userId
	 * @param {string} privilege
	 */
	(userId, privilege) => {
		const user = Users.findOne({ _id: userId });
		if (!user) {
			throw new Meteor.Error(404, 'User not found');
		}

		const operator = Meteor.user();

		if (UserPrivilegeUtils.privileged(operator, 'admin') || operator._id === user._id) {
			Users.update(
				{ _id: user._id },
				{ $pull: { privileges: privilege } },
				AsyncTools.checkUpdateOne,
			);
		}
	},
);

export const hidePricePolicy = ServerMethod('user.hidePricePolicy', () => {
	Users.update(Meteor.userId(), { $set: { hidePricePolicy: true } });
});

export const name = ServerMethod(
	'user.name',
	/**
	 * @param {string} userId
	 */
	function (userId) {
		this.unblock();
		const user = Users.findOne(userId, { fields: { username: 1 } });
		if (!user) {
			return false;
		}
		return user.username;
	},
);

export const updateLocale = ServerMethod(
	'user.updateLocale',
	/**
	 * @param {string} locale
	 */
	(locale) => {
		Users.update(Meteor.userId(), {
			$set: { locale },
		});
	},
);

Meteor.methods({
	/**
	 * Recalculate the groups and badges field
	 */
	'user.updateBadges'(selector) {
		Users.find(selector).forEach((originalUser) => {
			const userId = originalUser._id;

			AsyncTools.untilClean((resolve, reject) => {
				const user = Users.findOne(userId);

				if (!user) {
					resolve(true);
					return;
				}

				const groups = [];
				Groups.find({ members: user._id }).forEach((group) => {
					groups.push(group._id);
				});

				const badges = groups.slice();
				badges.push(user._id);

				const update = {
					$set: {
						groups,
						badges,
					},
				};

				Users.rawCollection().update({ _id: user._id }, update, (err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result.result.nModified === 0);
					}
				});
			});
		});
	},
});
