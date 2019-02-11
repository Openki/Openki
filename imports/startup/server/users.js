import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
	// The Log is append-only so we only watch for additions
	Meteor.users.find({}, { fields: { notifications: 1, emails: 1 } }).observe({
		added: Profile.updateAcceptsMessages,
		updated: Profile.updateAcceptsMessages
	});
});