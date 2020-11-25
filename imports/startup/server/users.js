import { Meteor } from 'meteor/meteor';

import Profile from '/imports/utils/profile';

Meteor.startup(() => {
	Meteor.users.find({}, { fields: { notifications: 1, emails: 1 } }).observe({
		added: Profile.updateAcceptsMessages,
		updated: Profile.updateAcceptsMessages,
	});
});
