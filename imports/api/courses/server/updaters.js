// Update the visitor flag to false once the email-address is verified.
// https://stackoverflow.com/a/32805985/2652567
Meteor.users.find().observe({
	changed: function (oldUser, newUser) {
		if (! _.findWhere(oldUser.emails, { verified: true }) &&
			_.findWhere(newUser.emails, { verified: true })) {
			Meteor.users.update(newUser._id, { $set: { visitor: false } });
		}
	}
});
