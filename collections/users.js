import '/imports/Profile.js';

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

Users = {};

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

	update_userdata: function(username, email, notifications, privacy) {
		check(username, String);
		check(email, String);
		check(notifications, Boolean);

		var user = Meteor.user();

		var changes = {};
		if (user.username !== username) { changes.username = saneText(username).substring(0, 200); }
		if (!user.emails || !user.emails[0] || user.emails[0].address !== email) {
			// Working under the assumption that there is only one address
			// if there was more than one address oops I accidentally your addresses
			email = email.trim();
			if (email && email.length > 3) {
				if (Meteor.users.findOne({ _id: { $ne: user._id }, 'emails.address': email })) {
					throw new Meteor.Error('emailExists', 'Email address already in use');
				}
				changes.emails = [{ address: email, verified: false }];
			} else {
				changes.emails = [];
			}
		}
		if (!_.isEmpty(changes)) {
			Meteor.users.update(Meteor.userId(), {
				$set: changes
			});
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