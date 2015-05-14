privilegedTo = function(privilege) {
	var user = Meteor.user();
	return privileged(user, privilege);
}

privileged = function(user, privilege) {
	return (
	    user
	    && user.privileges
	    && user.privileges.indexOf(privilege) > -1
	);
}

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
