import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';
import { runBackgroundTasks } from '/imports/utils/background-tasks';

runBackgroundTasks && Meteor.startup(() => {
	SSR.compileTemplate('emailBase', Assets.getText('emails/base.html'));
});
