import { robots } from 'meteor/gadicohen:robots-txt';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import '/imports/startup/both';
import '/imports/startup/server';

import Version from '/imports/api/version/version';
import { Users } from '/imports/api/users/users';

import { applyUpdates } from '/server/lib/updates';

import { AsyncTools } from '/imports/utils/async-tools';

function initializeDbCacheFields() {
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
}

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

	(Meteor.settings.admins || []).forEach((username) => {
		const user = Users.findOne({ username });
		if (user) {
			Users.update({ _id: user._id }, { $addToSet: { privileges: 'admin' } });
		}
	});

	/* Initialize cache-fields on startup */
	if (Meteor.settings.startup?.buildDbCacheAsync) {
		Meteor.setTimeout(() => {
			initializeDbCacheFields();
		}, 0);
	} else {
		initializeDbCacheFields();
	}
});
