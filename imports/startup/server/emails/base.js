import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';

Meteor.startup(() => {
	SSR.compileTemplate('emailBase', Assets.getText('emails/base.html'));
});
