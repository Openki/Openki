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
// ===========================



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
	}
});
