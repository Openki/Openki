import { Meteor } from 'meteor/meteor';

import Profile from '/imports/utils/profile';

Meteor.startup(() => {
	SSR.compileTemplate('userVerifyEmailMail', Assets.getText('mails/userVerifyEmailMail.html'));
	SSR.compileTemplate('userResetPasswordMail', Assets.getText('mails/userResetPasswordMail.html'));

	Meteor.users.find({}, { fields: { notifications: 1, emails: 1 } }).observe({
		added: Profile.updateAcceptsMessages,
		updated: Profile.updateAcceptsMessages,
	});
});
