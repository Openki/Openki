import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';
import { runBackgroundTasks } from '/imports/utils/background-tasks';

runBackgroundTasks && Meteor.startup(() => {
	SSR.compileTemplate('reportEmail', Assets.getText('emails/report.html'));
});
