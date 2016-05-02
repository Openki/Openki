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
// "profile"      -> {name: String, locale: Lang}
// "privileges"   -> [upload, admin]
// "lastLogin"    -> Date
// groups         -> List of groups the user is a member of, calculated by updateBadges()
// badges         -> union of user's id and group ids for permission checking, calculated by updateBadges()
// ===========================

User = function() {};

User.prototype.mayPromoteWith = function(group) {
	var groupId = _id(group);
	if (!groupId) return false;
	return this.groups.indexOf(groupId) >= 0;
};

User.prototype.mayEdit = function(course) {
	return _.intersection(this.badges, course.organizers).length > 0;
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
updateBadges = function(userId) {
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

		return result.nModified === 0;
	});
};

Meteor.methods({
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
	updateBadges: function(selector) {
		Meteor.users.find(selector).forEach(function(user) {
			updateBadges(user._id);
		});
	},
});
