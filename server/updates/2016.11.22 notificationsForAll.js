UpdatesAvailable['2016.11.22 notificationsForAll'] = function() {
	return Meteor.users.update({}, { $set: { notifications: true } }, { multi: true });
};