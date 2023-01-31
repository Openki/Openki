import { Meteor } from 'meteor/meteor';

import { Users } from '/imports/api/users/users';
import * as coursesTenantDenormalizer from '/imports/api/courses/tenantDenormalizer';
import * as eventsCategoriesDenormalizer from '/imports/api/events/categoriesDenormalizer';
import * as eventsTenantDenormalizer from '/imports/api/events/tenantDenormalizer';
import * as usersTenantsDenormalizer from '/imports/api/users/tenantsDenormalizer';

import * as Profile from '/imports/utils/profile';
import { PrivateSettings } from '/imports/utils/PrivateSettings';
import * as AsyncTools from '/imports/utils/async-tools';
import { MeteorAsync } from '/imports/utils/promisify';
import { Log } from '/imports/api/log/log';

function updateDbCacheFields() {
	try {
		Log.record('db.cache.start', [], {});

		// Resync location cache in events
		Meteor.call('event.updateVenue', {}, AsyncTools.logErrors);
		Log.record('db.cache.log.event.updateVenue', [], {});

		// Update list of organizers per course
		Meteor.call('course.updateGroups', {}, AsyncTools.logErrors);
		Log.record('db.cache.log.course.updateGroups', [], {});

		eventsCategoriesDenormalizer.onStartUp();
		Log.record('db.cache.log.eventsCategoriesDenormalizer', [], {});

		// Update List of badges per user
		Meteor.call('user.updateBadges', {}, AsyncTools.logErrors);
		Log.record('db.cache.log.user.updateBadges', [], {});

		coursesTenantDenormalizer.onStartUp();
		Log.record('db.cache.log.coursesTenantDenormalizer', [], {});
		eventsTenantDenormalizer.onStartUp();
		Log.record('db.cache.log.eventsTenantDenormalizer', [], {});
		usersTenantsDenormalizer.onStartUp();
		Log.record('db.cache.log.usersTenantsDenormalizer', [], {});

		// The `acceptsPrivateMessage` field is denormalized via `observe` to keep up to date after a
		// change is made.
		Users.find({}, { fields: { allowPrivateMessages: 1, emails: 1 } }).observe({
			added: Profile.updateAcceptsPrivateMessages,
			changed: Profile.updateAcceptsPrivateMessages,
		});
		Log.record('db.cache.log.updateAcceptsPrivateMessages', [], {});

		// Keep the nextEvent entry updated
		// On startup do a full scan to catch stragglers
		Meteor.call('course.updateNextEvent', {}, AsyncTools.logErrors);
		Log.record('db.cache.log.course.updateNextEvent', [], {});
		Meteor.call('region.updateCounters', {}, AsyncTools.logErrors);
		Log.record('db.cache.log.region.updateCounters', [], {});
		Meteor.setInterval(
			() => {
				// Update nextEvent for courses where it expired
				Meteor.call(
					'course.updateNextEvent',
					{ 'nextEvent.start': { $lt: new Date() } },
					AsyncTools.logErrors,
				);
				Meteor.call('region.updateCounters', {}, AsyncTools.logErrors);
			},
			60 * 1000, // Check every minute
		);
	} catch (e) {
		Log.record('db.cache.error', [], e);
	}
}

Meteor.startup(async () => {
	/* Initialize cache-fields on startup (Also called calculated fields or denomalized data) */
	if (PrivateSettings.startup.buildDbCacheAsync) {
		await MeteorAsync.defer();

		updateDbCacheFields();
	} else {
		updateDbCacheFields();
	}
});
