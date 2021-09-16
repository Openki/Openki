import { robots } from 'meteor/gadicohen:robots-txt';
import { Meteor } from 'meteor/meteor';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

Meteor.startup(() => {
	if (PrivateSettings.robots === false) {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: /');
	} else {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: ');
	}
});
