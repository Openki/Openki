import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';

import Profile from '/imports/utils/profile';

Meteor.startup(() => {
	SSR.compileTemplate('userVerifyEmailMail', Assets.getText('mails/userVerifyEmailMail.html'));
	SSR.compileTemplate('userResetPasswordMail', Assets.getText('mails/userResetPasswordMail.html'));

	// generate a avatar color for every new user
	Accounts.onLogin(() => {
		const user = Meteor.user();

		if (user && user.avatar?.color === undefined) {
			Meteor.call('user.updateAvatarColor');
		}
	});

	Meteor.users.find({}, { fields: { allowPrivateMessages: 1, emails: 1 } }).observe({
		added: Profile.updateAcceptsPrivateMessages,
		changed: Profile.updateAcceptsPrivateMessages,
	});
});
