export default Profile = {};
import '/imports/collections/Log.js';


Profile.updateAcceptsMessages = function(userSelector) {
	let changed = 0;

	Meteor.users.find(userSelector).forEach(user => {
		var newValue = user.emailAddress()
					&& user.notifications;

		changed += Users.update(user._id, {
			$set: { acceptsMessages: !!newValue }
		});
	});

	return changed;
};


Profile.Username = {};

Profile.Username.change = function(userId, newName) {
	check(userId, String);
	check(newName, String);

	let result, success;
	try {
		result = Meteor.users.update(userId, {
			$set: { username: newName }
		});
		success = result > 0;
	} catch (e) {
		result = e;
		success = false;
	}
	Log.record('Profile.Username', [userId],
		{ userId: userId
		, name: newName
		, success
		, result
		, cause: "profile change"
		}
	);

	return success;
};


Profile.Email = {};

Profile.Email.change = function(userId, email, reason) {
	check(userId, String);
	check(email, Match.Optional(String));
	check(reason, String);

	Log.record('Profile.Email', [userId],
		{ userId: userId
		, email: email
		, reason: reason
		}
	);

	var newValue = [];
	if (email) {
		newValue = [{ address: email, verified: false }];
	}

	Meteor.users.update(userId, {
		$set: { emails: newValue }
	});
	Profile.updateAcceptsMessages(userId);
};

Profile.Notifications = {};

/** Update the receiveNotifications setting for a user
  *
  * @param   {ID} userId - update the setting for this user
  * @param {Bool} enable - new state of the flag
  * @param   {ID} rel    - related ID for the Log (optional)
  *
  */
Profile.Notifications.change = function(userId, enable, relId, reason) {
	check(userId, String);
	check(enable, Boolean);
	check(relId, Match.Optional(String));
	check(reason, String);

	var rel = [userId];
	if (relId) rel.push(relId);
	Log.record('Profile.Notifications', rel,
		{ userId: userId
		, enable: enable
		, reason: reason
		}
	);

	Meteor.users.update(userId, {
		$set: { 'notifications': enable }
	});
	Profile.updateAcceptsMessages(userId);
};

/** Handle unsubscribe token
  *
  * @param {String} token - the unsubscribe token passed by the user
  * @return {Bool} whether the token was accepted
  */
Profile.Notifications.unsubscribe = function(token) {
	check(token, String);

	var accepted = false;

	// Find the relevant notification result
	Log.find({
		rel: token
	}).forEach(function(entry) {
		// See whether it was indeed a secret token.
		// This check is not redundant because public ID like courseID
		// are also written into the rel-index and would be found if provided.
		if (entry.body.unsubToken === token) {
			Profile.Notifications.change(entry.body.recipient, false, entry._id, "unsubscribe token");
			accepted = true;
		}
	});
	return accepted;
};


Profile.Region = {};

/** Update the selected region for a user
  *
  * @param {ID} userId   - update region for this user
  * @param {ID} regionId - choose this region for this user
  *
  * @return {Bool} whether the change was accepted
  */
Profile.Region.change = function(userId, regionId, reason) {
	check(userId, String);
	check(regionId, String);
	check(reason, String);

	var region = Regions.findOne(regionId);
	var accepted = !!region;

	Log.record('Profile.Region', [userId, regionId],
		{ userId: userId
		, regionId: regionId
		, accepted: accepted
		, reason: reason
		}
	);

	if (accepted) {
		Meteor.users.update(userId, { $set: { 'profile.regionId':  region._id } });
	}

	return accepted;
};
