import { robots } from 'meteor/gadicohen:robots-txt';
import { Meteor } from 'meteor/meteor';
import { PrivateSettings } from '/imports/utils/PrivateSettings';
import { runBackgroundTasks } from '/imports/utils/background-tasks';

runBackgroundTasks && Meteor.startup(() => {
	if (PrivateSettings.robots === false) {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: /');
	} else {
		robots.addLine('User-agent: *');
		if (PrivateSettings.hideProfiles === true) {
			robots.addLine('Disallow: /user/');
		} else {
			robots.addLine('Disallow: ');
		}
	}
});
