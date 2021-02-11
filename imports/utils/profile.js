import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import Log from '/imports/api/log/log';
import Regions from '/imports/api/regions/regions';
import Users from '/imports/api/users/users';

/** @typedef {import('../api/users/users').UserModel} UserModel */

const Profile = {};

/**
 * @param {UserModel} user
 */
Profile.updateAcceptsPrivateMessages = function (user) {
	const acceptsPrivateMessages = Boolean(user.emailAddress() && user.allowPrivateMessages);

	if (user.acceptsPrivateMessages !== acceptsPrivateMessages) {
		Users.update(user._id, {
			$set: { acceptsPrivateMessages },
		});
	}
};

Profile.Username = {};

/**
 * @param {string} userId
 * @param {string} newName
 */
Profile.Username.change = function (userId, newName) {
	check(userId, String);
	check(newName, String);

	let result; let
		success;
	try {
		result = Meteor.users.update(userId, {
			$set: { username: newName },
		});
		success = result > 0;
	} catch (e) {
		result = e;
		success = false;
	}
	Log.record('Profile.Username', [userId],
		{
			userId,
			name: newName,
			success,
			result,
			cause: 'profile change',
		});

	return success;
};


Profile.Email = {};

/**
 * @param {string} userId
 * @param {string|undefined} email
 * @param {string} reason
 */
Profile.Email.change = function (userId, email, reason) {
	check(userId, String);
	check(email, Match.Optional(String));
	check(reason, String);

	Log.record('Profile.Email', [userId],
		{
			userId,
			email,
			reason,
		});

	/** @type {{ address: string; verified: boolean; }[]} */
	let newValue = [];
	if (email) {
		newValue = [{ address: email, verified: false }];
	}

	Meteor.users.update(userId, {
		$set: { emails: newValue },
	});
};

Profile.Notifications = {};

/**
 * Update the receive automated notifications setting for a user
 * @param {string} userId update the setting for this user
 * @param {boolean} enable new state of the flag
 * @param {string|undefined} relatedId related ID for the Log (optional)
 * @param {string} reason
 *
 */
Profile.Notifications.change = function (userId, enable, relatedId, reason) {
	check(userId, String);
	check(enable, Boolean);
	check(relatedId, Match.Optional(String));
	check(reason, String);

	const relatedIds = [userId];
	if (relatedId) {
		relatedIds.push(relatedId);
	}
	Log.record('Profile.Notifications', relatedIds,
		{
			userId,
			enable,
			reason,
		});

	Meteor.users.update(userId, {
		$set: { notifications: enable },
	});
};

/**
 * Handle unsubscribe token
 * @param {string} token the unsubscribe token passed by the user
 * @return {boolean} whether the token was accepted
 */
Profile.Notifications.unsubscribe = function (token) {
	check(token, String);

	let accepted = false;

	// Find the relevant notification result
	Log.find({
		rel: token,
	}).forEach((entry) => {
		// See whether it was indeed a secret token.
		// This check is not redundant because public ID like courseID
		// are also written into the rel-index and would be found if provided.
		if (entry.body.unsubToken === token) {
			Profile.Notifications.change(entry.body.recipient, false, entry._id, 'unsubscribe token');
			accepted = true;
		}
	});
	return accepted;
};


Profile.PrivateMessages = {};

/**
 * Update the receive private messages setting for a user
 * @param {string} userId update the setting for this user
 * @param {boolean} enable new state of the flag
 * @param {string|undefined} relatedId related ID for the Log (optional)
 * @param {string} reason
 */
Profile.PrivateMessages.change = function (userId, enable, relatedId, reason) {
	check(userId, String);
	check(enable, Boolean);
	check(relatedId, Match.Optional(String));
	check(reason, String);

	const relatedIds = [userId];
	if (relatedId) {
		relatedIds.push(relatedId);
	}
	Log.record('Profile.PrivateMessages', relatedIds,
		{
			userId,
			enable,
			reason,
		});

	Meteor.users.update(userId, {
		$set: { allowPrivateMessages: enable },
	});
};

/**
 * Handle unsubscribe from private messages token
 * @param {string} token the unsubscribe token passed by the user
 * @return {boolean} whether the token was accepted
 */
Profile.PrivateMessages.unsubscribe = function (token) {
	check(token, String);

	let accepted = false;

	// Find the relevant private message result
	Log.find({
		rel: token,
	}).forEach((entry) => {
		// See whether it was indeed a secret token.
		// This check is not redundant because public ID like courseID
		// are also written into the rel-index and would be found if provided.
		if (entry.body.unsubToken === token) {
			Profile.PrivateMessages.change(entry.body.recipient, false, entry._id, 'unsubscribe token');
			accepted = true;
		}
	});
	return accepted;
};

Profile.Region = {};

/**
 * Update the selected region for a user
 * @param {string} userId update region for this user
 * @param {string} regionId choose this region for this user
 * @param {string} reason
 *
 * @return {boolean} whether the change was accepted
 */
Profile.Region.change = function (userId, regionId, reason) {
	check(userId, String);
	check(regionId, String);
	check(reason, String);

	const region = Regions.findOne(regionId);
	const accepted = Boolean(region);

	Log.record('Profile.Region', [userId, regionId],
		{
			userId,
			regionId,
			accepted,
			reason,
		});

	if (accepted) {
		Meteor.users.update(userId, { $set: { 'profile.regionId': region._id } });
	}

	return accepted;
};

Profile.AvatarColor = {};

/**
 * Update the user's color preference
 * @param {String} userId update color for this user
 * @param {Number} color rgb color hue (0 - 255)
 */
Profile.AvatarColor.change = function (userId, color) {
	check(userId, String);
	check(color, Number);

	// check if color is a valid rgb hue
	const accepted = color >= 0 && color <= 255;

	Log.record('Avatar.Color', [userId],
		{
			userId,
			color,
			accepted,
		});

	if (accepted) {
		Meteor.users.update(userId, { $set: { 'avatar.color': color } });
	}

	return accepted;
};

export default Profile;
