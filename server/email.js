import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Email } from 'meteor/email';

import fs from 'fs';

if (Meteor.settings.siteEmail) {
	Accounts.emailTemplates.from = Meteor.settings.siteEmail;
}

if (Meteor.settings.public.siteName) {
	Accounts.emailTemplates.siteName = Meteor.settings.public.siteName;
}

Meteor.startup(() => {
	SSR.compileTemplate('messageReport', Assets.getText('messages/report.html'));
});

if (Meteor.isDevelopment) {
	// Create /.temp to test emails
	Email.hookSend((email) => {
		fs.writeFile(
			`${process.env.PWD}/.temp/${new Date().toISOString()} ${email.subject}.html`,
			email.html,
			() => {},
		);

		return true;
	});
}
