import '/imports/Profile.js';
import '/imports/api/ApiError.js';

// ======== DB-Model: ========
// "_id"          -> ID
// "createdAt"    -> Date
// "services"     -> {
//     password: {
//         bcrypt:       String},
//     github: {
//         id:           Int32
//         accessToken:  String
//         email:        String/null
//         username:     String }
//     facebook: {
//         accessTocken: String
//         expiresAt:    Double
//         id:           String
//         email:        String       (not allways)
//         name:         String
//         first_name:   String
//         last_name:    String
//         link:         String
//         gender:       String
//         locale:       String }     ex: de_DE, en_US
//     google: {
//         accessTocken: String
//         idTocken:     String
//         expiresAt:    Double
//         id:           String
//         email:        String
//         verified_email:Boolean
//         name:         String
//         given_name:   String
//         family_name:  String
//         picture:      String       (link)
//         locale:       String }      ex: de
//         scope:        [https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile]
//     resume: {
//         loginTockens: [{when: Date, hashed: String}]}}
// "username"     -> String
// "emails"       -> [{address: String, verified: Boolean}]
// "profile"      -> {name: String, locale: Lang, regionId: ID}
// "privileges"   -> [admin]
// "lastLogin"    -> Date
// groups         -> List of groups the user is a member of, calculated by updateBadges()
// badges         -> union of user's id and group ids for permission checking, calculated by updateBadges()
// ===========================

// Alias users collection to the expected name
Users = Meteor.users;

User = function() {};


/** Check whether the user may promote things with the given group
  *
  * @param {String/Object} group - The group to check, this may be an Id or a group object
  * @returns {Boolean}
  *
  * The user must be a member of the group to be allowed to promote things with it.
  */
User.prototype.mayPromoteWith = function(group) {
	var groupId = _id(group);
	if (!groupId) return false;
	return this.groups.indexOf(groupId) >= 0;
};

/** Get email address of user
  *
  * @returns String with email address or Boolean false
  */
User.prototype.emailAddress = function() {
	return this.emails
	    && this.emails[0]
		&& this.emails[0].address
		|| false;
};

/** Get verified email address of user
  *
  * @returns String with verified email address or Boolean false
  */
User.prototype.verifiedEmailAddress = function() {
	let emailRecord = this.emails
	               && this.emails[0];
	return emailRecord
	    && emailRecord.verified
		&& emailRecord.address
		|| false;
};




Meteor.users._transform = function(user) {
	return _.extend(new User(), user);
};


privilegedTo = function(privilege) {
	var user = Meteor.user();
	return privileged(user, privilege);
};

privileged = function(user, privilege) {
	// Load user object if ID was passed
	if (typeof user === 'string' || user instanceof String) {
		user = Meteor.users.findOne({ _id: user });
	}

	return (
		user
		&& user.privileges
		&& user.privileges.indexOf(privilege) > -1
	);
};

UserLib = {
	searchPrefix: function(prefix, options) {
		var prefixExp = '^' + prefix.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
		var query = { username: new RegExp(prefixExp, 'i') };

		var exclude = options.exclude;
		if (exclude !== undefined) {
			check(exclude, [String]);
			query._id = { $nin: exclude };
			delete options.exclude;
		}

		return Meteor.users.find(query, options);
	}
};


// Update list of groups and badges
Users.updateBadges = function(userId) {
	untilClean(function() {
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
};

Meteor.methods({
	/** Set user region
	  */
	'user.regionChange': function(newRegion) {
		Profile.Region.change(Meteor.userId(), newRegion, "client call");
	},

	update_userdata: function(username, email, notifications) {
		check(username, String);
		check(email, String);
		check(notifications, Boolean);

		// The error handling in this function is flawed in that we drop
		// out on the first error instead of collecting them. So fields
		// that are validated later will not be saved if an earlier field
		// causes us to fail.

		var user = Meteor.user();
		if (!user) return ApiError("plzLogin", "Not logged-in");

		const saneUsername = saneText(username).trim().substring(0, 200);
		if (saneUsername && user.username !== saneUsername) {
			let result = Profile.Username.change(user._id, saneUsername, "profile change");
			if (!result) {
				return ApiError("nameError", "Failed to update username");
			}
		}

		const trimmedEmail = email.trim();
		const newEmail = trimmedEmail || false;
		const previousEmail = user.emailAddress();

		if (newEmail !== previousEmail) {
			// Working under the assumption that there is only one address
			// if there was more than one address oops I accidentally your addresses
			if (email) {
				// Very lenient address validation routine
				if (email.length < 3) {
					return ApiError('emailInvalid', 'Email address invalid');
				}

				// Don't allow using an address somebody else uses
				if (Meteor.users.findOne({ _id: { $ne: user._id }, 'emails.address': email })) {
					return ApiError('emailExists', 'Email address already in use');
				}
				Profile.Email.change(user._id, email, "profile change");
			} else {
				// Remove email-address
				Profile.Email.change(user._id, false, "profile change");
			}
		}

		if (user.notifications !== notifications) {
			Profile.Notifications.change(user._id, notifications, undefined, "profile change");
		}
	},

	delete_profile: function() {
		var user = Meteor.user();
		if (user) Meteor.users.remove({ _id: user._id });
	},

	addPrivilege: function(userId, privilege) {
		// At the moment, only admins may hand out privileges, so this is easy
		if (privilegedTo('admin')) {
			var user = Meteor.users.findOne({_id: userId});
			if (!user) throw new Meteor.Error(404, "User not found");
			Meteor.users.update(
				{_id: user._id},
				{ '$addToSet': {'privileges': privilege}},
				checkUpdateOne
			);
		}
	},

	removePrivilege: function(userId, privilege) {
		var user = Meteor.users.findOne({_id: userId});
		if (!user) throw new Meteor.Error(404, "User not found");

		var operator = Meteor.user();

		if (privileged(operator, 'admin') || operator._id == user._id) {
			Meteor.users.update(
				{_id: user._id},
				{ '$pull': {'privileges': privilege}},
				checkUpdateOne
			);
		}
	},


	// Recalculate the groups and badges field
	'user.updateBadges': function(selector) {
		Meteor.users.find(selector).forEach(function(user) {
			Users.updateBadges(user._id);
		});
	},
});

if (Meteor.isServer) {
	Meteor.methods({
		'user.name': function(userId) {
			this.unblock();
			var user = Meteor.users.findOne(userId);
			if (!user) return false;
			var username = user.username;
			return username;
		}
	});
}
