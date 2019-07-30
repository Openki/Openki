import '/imports/startup/both';
import '/imports/startup/server';

import AsyncTools from '/imports/utils/async-tools';

import Version from '/imports/api/version/version';

import applyUpdates from '/server/lib/updates';

Meteor.startup(() => {
	applyUpdates();

	const runningVersion = Version.findOne();
	if (typeof VERSION !== 'undefined' && (
		(!runningVersion || runningVersion.complete !== VERSION.complete)
			|| (runningVersion.commit !== VERSION.commit))
	) {
		const newVersion = _.extend(VERSION, {
			activation: new Date(),
		});
		Version.upsert({}, newVersion);
	}
	Version.update({}, { $set: { lastStart: new Date() } });

	if (Meteor.settings.robots === false) {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: /');
	} else {
		robots.addLine('User-agent: *');
		robots.addLine('Disallow: ');
	}

	const serviceConf = Meteor.settings.service;
	if (serviceConf) {
		if (serviceConf.google
		) {
			ServiceConfiguration.configurations.remove({
				service: 'google',
			});
			ServiceConfiguration.configurations.insert({
				service: 'google',
				loginStyle: 'popup',
				clientId: serviceConf.google.clientId,
				secret: serviceConf.google.secret,
			});
		}
		if (serviceConf.facebook) {
			ServiceConfiguration.configurations.remove({
				service: 'facebook',
			});
			ServiceConfiguration.configurations.insert({
				service: 'facebook',
				loginStyle: 'popup',
				appId: serviceConf.facebook.appId,
				secret: serviceConf.facebook.secret,
			});
		}
		if (serviceConf.github) {
			ServiceConfiguration.configurations.remove({
				service: 'github',
			});
			ServiceConfiguration.configurations.insert({
				service: 'github',
				loginStyle: 'popup',
				clientId: serviceConf.github.clientId,
				secret: serviceConf.github.secret,
			});
		}
	}

	if (Meteor.settings.admins) {
		// eslint-disable-next-line guard-for-in
		for (const name in Meteor.settings.admins) {
			const user = Meteor.users.findOne({ username: Meteor.settings.admins[name] });
			if (user) {
				Meteor.users.update({ _id: user._id }, { $addToSet: { privileges: 'admin' } });
			}
		}
	}

	/* Initialize cache-fields on startup */

	// Resync location cache in events
	Meteor.call('event.updateVenue', {}, AsyncTools.logErrors);

	// Update list of organizers per course
	Meteor.call('course.updateGroups', {}, AsyncTools.logErrors);

	// Update List of badges per user
	Meteor.call('user.updateBadges', {}, AsyncTools.logErrors);

	Meteor.call('region.updateCounters', {}, AsyncTools.logErrors);

	// Keep the nextEvent entry updated
	// On startup do a full scan to catch stragglers
	Meteor.call('course.updateNextEvent', {}, AsyncTools.logErrors);
	Meteor.setInterval(
		() => {
			// Update nextEvent for courses where it expired
			Meteor.call('course.updateNextEvent', { 'nextEvent.start': { $lt: new Date() } });

			Meteor.call('region.updateCounters', {}, AsyncTools.logErrors);
		},
		60 * 1000, // Check every minute
	);
});
