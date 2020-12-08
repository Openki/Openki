import { Meteor } from 'meteor/meteor';

import Groups from '/imports/api/groups/groups';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import Profile from '/imports/utils/profile';
import ApiError from '/imports/api/ApiError';
import IsEmail from '/imports/utils/email-tools';
import StringTools from '/imports/utils/string-tools';
import AsyncTools from '/imports/utils/async-tools';

const updateEmail = function (email, user) {
	const newEmail = email.trim() || false;
	const oldEmail = user.emailAddress();

	// for users with email not yet set, we dont want to force them
	// to enter a email when they change other profile settings.
	if (newEmail === oldEmail) {
		return false;
	}

	if (!newEmail) {
		return ApiError('noEmail', 'Please enter a email.');
	}

	if (!IsEmail(newEmail)) {
		return ApiError('emailNotValid', 'email invalid');
	}

	// Don't allow using an address somebody else uses
	const existingUser = Accounts.findUserByEmail(newEmail);
	if (existingUser) {
		return ApiError('emailExists', 'Email already exists.');
	}

	Profile.Email.change(user._id, newEmail, 'profile change');
	return true;
};

Meteor.methods({
	/** Set user region
	  */
	'user.regionChange'(newRegion) {
		Profile.Region.change(Meteor.userId(), newRegion, 'client call');
	},

	'user.updateData'(username, email, notifications) {
		check(username, String);
		check(email, String);
		check(notifications, Boolean);

		// The error handling in this function is flawed in that we drop
		// out on the first error instead of collecting them. So fields
		// that are validated later will not be saved if an earlier field
		// causes us to fail.

		const user = Meteor.user();
		if (!user) {
			return ApiError('plzLogin', 'Not logged-in');
		}

		const saneUsername = StringTools.saneTitle(username).trim().substring(0, 200);

		const result = Profile.Username.change(user._id, saneUsername, 'profile change');
		if (!result) {
			return ApiError('nameError', 'Failed to update username');
		}

		updateEmail(email, user);

		if (user.notifications !== notifications) {
			Profile.Notifications.change(user._id, notifications, undefined, 'profile change');
		}
		return true;
	},

	'user.updateEmail'(email) {
		check(email, String);
		const user = Meteor.user();
		if (!user) {
			return ApiError('plzLogin', 'Not logged-in');
		}
		updateEmail(email, user);
		return true;
	},

	'user.remove'() {
		const user = Meteor.user();
		if (user) {
			Meteor.users.remove({ _id: user._id });
		}
	},

	'user.addPrivilege'(userId, privilege) {
		// At the moment, only admins may hand out privileges, so this is easy
		if (UserPrivilegeUtils.privilegedTo('admin')) {
			const user = Meteor.users.findOne({ _id: userId });
			if (!user) {
				throw new Meteor.Error(404, 'User not found');
			}
			Meteor.users.update(
				{ _id: user._id },
				{ $addToSet: { privileges: privilege } },
				AsyncTools.checkUpdateOne,
			);
		}
	},

	'user.removePrivilege'(userId, privilege) {
		const user = Meteor.users.findOne({ _id: userId });
		if (!user) {
			throw new Meteor.Error(404, 'User not found');
		}

		const operator = Meteor.user();

		if (UserPrivilegeUtils.privileged(operator, 'admin') || operator._id === user._id) {
			Meteor.users.update(
				{ _id: user._id },
				{ $pull: { privileges: privilege } },
				AsyncTools.checkUpdateOne,
			);
		}
	},


	// Recalculate the groups and badges field
	'user.updateBadges'(selector) {
		Meteor.users.find(selector).forEach(originalUser => {
			const userId = originalUser._id;

			/* eslint-disable-next-line consistent-return */
			AsyncTools.untilClean((resolve, reject) => {
				const user = Meteor.users.findOne(userId);
				if (!user) {
					return resolve(true);
				}

				const groups = [];
				Groups.find({ members: user._id }).forEach(group => {
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

				Meteor.users.rawCollection().update({ _id: user._id },
					update,
					(err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result.result.nModified === 0);
						}
					});
			});
		});
	},

	'user.hidePricePolicy'(user) {
		Meteor.users.update(
			{ _id: user._id },
			{ $set: { hidePricePolicy: true } },
		);
	},

	'user.name'(userId) {
		this.unblock();
		const user = Meteor.users.findOne(userId, { fields: { username: 1 } });
		if (!user) {
			return false;
		}
		return user.username;
	},

	'user.updateLocale'(locale) {
		Meteor.users.update(Meteor.userId(), {
			$set: { 'profile.locale': locale },
		});
	},
});
