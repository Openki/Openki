import { robots } from 'meteor/gadicohen:robots-txt';
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	if (Meteor.settings.robots === false) {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: /');
	} else {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: ');
	}
});
