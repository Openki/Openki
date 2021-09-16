import { Meteor } from 'meteor/meteor';

import { AsyncTools } from '/imports/utils/async-tools';
import * as coursesTenantDenormalizer from '/imports/api/courses/tenantDenormalizer';
import * as eventsTenantDenormalizer from '/imports/api/events/tenantDenormalizer';
import * as usersTenantsDenormalizer from '/imports/api/users/tenantsDenormalizer';

import { Users } from '/imports/api/users/users';

import Profile from '/imports/utils/profile';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

function updateDbCacheFields() {
	// Resync location cache in events
	Meteor.call('event.updateVenue', {}, AsyncTools.logErrors);

	// Update list of organizers per course
	Meteor.call('course.updateGroups', {}, AsyncTools.logErrors);

	// Update List of badges per user
	Meteor.call('user.updateBadges', {}, AsyncTools.logErrors);

	coursesTenantDenormalizer.onStartUp();
	eventsTenantDenormalizer.onStartUp();
	usersTenantsDenormalizer.onStartUp();

	// The `acceptsPrivateMessage` field is denormalized via `observe` to keep up to date after a
	// change is made.
	Users.find({}, { fields: { allowPrivateMessages: 1, emails: 1 } }).observe({
		added: Profile.updateAcceptsPrivateMessages,
		changed: Profile.updateAcceptsPrivateMessages,
	});

	// Keep the nextEvent entry updated
	// On startup do a full scan to catch stragglers
	Meteor.call('course.updateNextEvent', {}, AsyncTools.logErrors);
	Meteor.call('region.updateCounters', {}, AsyncTools.logErrors);
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
	/* Initialize cache-fields on startup (Also called calculated fields or denomalized data) */
	if (PrivateSettings.startup.buildDbCacheAsync) {
		Meteor.setTimeout(() => {
			updateDbCacheFields();
		}, 0);
	} else {
		updateDbCacheFields();
	}
});
