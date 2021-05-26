import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';

if (Meteor.settings.siteEmail) {
	Accounts.emailTemplates.from = Meteor.settings.siteEmail;
}

if (Meteor.settings.public.siteName) {
	Accounts.emailTemplates.siteName = Meteor.settings.public.siteName;
}

Meteor.startup(() => {
	SSR.compileTemplate('messageReport', Assets.getText('messages/report.html'));
});
