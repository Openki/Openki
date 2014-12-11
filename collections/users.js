Meteor.methods({
	delete_profile: function() {
		var user = Meteor.user();
		if (user) Meteor.users.remove({ _id: user._id });
	}
});