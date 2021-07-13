import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	SSR.compileTemplate('userVerifyEmailMail', Assets.getText('mails/userVerifyEmailMail.html'));
	SSR.compileTemplate('userResetPasswordMail', Assets.getText('mails/userResetPasswordMail.html'));
});
