import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';

Meteor.startup(() => {
	SSR.compileTemplate('reportEmail', Assets.getText('emails/report.html'));
});
