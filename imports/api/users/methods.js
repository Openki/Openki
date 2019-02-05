import { Meteor } from 'meteor/meteor';

import Groups from '/imports/api/groups/groups.js';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';
import Profile from '/imports/utils/profile.js';
import '/imports/api/ApiError.js';
import { IsEmail } from '/imports/utils/email-tools.js';
import StringTools from '/imports/utils/string-tools.js';
import AsyncTools from '/imports/utils/async-tools.js';

updateEmail = function(email, user) {

	const trimmedEmail = email.trim();
	const newEmail = trimmedEmail || false;
	const previousEmail = user.emailAddress();

	if (! newEmail || newEmail !== previousEmail) {
		// Working under the assumption that there is only one address
		// if there was more than one address oops I accidentally your addresses
		if (newEmail) {
			if (! IsEmail(newEmail)) {
				return ApiError('emailNotValid', 'Email address invalid');
			}

			// Don't allow using an address somebody else uses
			if (Accounts.findUserByEmail(newEmail)) {
				return ApiError('emailExists', 'Email already exists.');
			}
			Profile.Email.change(user._id, newEmail, "profile change");
		} else {
			return ApiError('noEmail', 'Please enter a email.')
		}
	}
}

Meteor.methods({
	/** Set user region
	  */
	'user.regionChange': function(newRegion) {
		Profile.Region.change(Meteor.userId(), newRegion, "client call");
	},

	'user.updateData': function(username, email, notifications) {
		check(username, String);
		check(email, String);
		check(notifications, Boolean);

		// The error handling in this function is flawed in that we drop
		// out on the first error instead of collecting them. So fields
		// that are validated later will not be saved if an earlier field
		// causes us to fail.

		var user = Meteor.user();
		if (!user) return ApiError("plzLogin", "Not logged-in");

		const saneUsername = StringTools.saneTitle(username).trim().substring(0, 200);

		if (saneUsername.length === 0) return ApiError("noUserName", "username cannot be empty");
		if (saneUsername !== user.username && Accounts.findUserByUsername(saneUsername)) return ApiError("userExists", "username is already taken");

		let result = Profile.Username.change(user._id, saneUsername, "profile change");
		if (!result) {
			return ApiError("nameError", "Failed to update username");
		}

		updateEmail(email, user);

		if (user.notifications !== notifications) {
			Profile.Notifications.change(user._id, notifications, undefined, "profile change");
		}
	},

	'user.updateEmail': function(email) {
		check(email, String);
		var user = Meteor.user();
		if (!user) return ApiError("plzLogin", "Not logged-in");
		updateEmail(email, user);
	},

	'user.remove': function() {
		var user = Meteor.user();
		if (user) Meteor.users.remove({ _id: user._id });
	},

	'user.addPrivilege': function(userId, privilege) {
		// At the moment, only admins may hand out privileges, so this is easy
		if (UserPrivilegeUtils.privilegedTo('admin')) {
			var user = Meteor.users.findOne({_id: userId});
			if (!user) throw new Meteor.Error(404, "User not found");
			Meteor.users.update(
				{_id: user._id},
				{ '$addToSet': {'privileges': privilege}},
				AsyncTools.checkUpdateOne
			);
		}
	},

	'user.removePrivilege': function(userId, privilege) {
		var user = Meteor.users.findOne({_id: userId});
		if (!user) throw new Meteor.Error(404, "User not found");

		var operator = Meteor.user();

		if (UserPrivilegeUtils.privileged(operator, 'admin') || operator._id == user._id) {
			Meteor.users.update(
				{_id: user._id},
				{ '$pull': {'privileges': privilege}},
				AsyncTools.checkUpdateOne
			);
		}
	},


	// Recalculate the groups and badges field
	'user.updateBadges': function(selector) {
		Meteor.users.find(selector).forEach(function(user) {
			const userId = user._id;

			AsyncTools.untilClean(function() {
				var user = Meteor.users.findOne(userId);
				if (!user) return true;

				var groups = [];
				Groups.find({ members: user._id }).forEach(function(group) {
					groups.push(group._id);
				});

				var badges = groups.slice();
				badges.push(user._id);

				var rawUsers = Meteor.users.rawCollection();
				var result = Meteor.wrapAsync(rawUsers.update, rawUsers)(
					{ _id: user._id },
					{ $set: {
						groups: groups,
						badges: badges,
					} },
					{ fullResult: true }
				);

				return result.result.nModified === 0;
			});
		});
	},

	'user.hidePricePolicy'(user) {
		Meteor.users.update(
			{ _id: user._id },
			{ '$set': { 'hidePricePolicy': true } }
		);
	},

	'user.name': function(userId) {
		this.unblock();
		var user = Meteor.users.findOne(userId);
		if (!user) return false;
		var username = user.username;
		return username;
	},

	'user.updateLocale'(locale) {
		Meteor.users.update(Meteor.userId(), {
			$set: { 'profile.locale': locale }
		});
	}
});
