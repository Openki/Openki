import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Events } from '/imports/api/events/events';

import { AffectedReplicaSelectors } from '/imports/utils/affected-replica-selectors';
import { visibleTenants } from '/imports/utils/visible-tenants';

Meteor.publish('events', (region?: string) => {
	check(region, Match.Optional(String));

	if (!region) {
		return Events.find({ tenant: { $in: visibleTenants() } });
	}
	return Events.find({ region, tenant: { $in: visibleTenants() } });
});

Meteor.publish('event', (eventId: string) => {
	check(eventId, String);

	return Events.find({ _id: eventId, tenant: { $in: visibleTenants() } });
});

Meteor.publish('Events.findFilter', (filter, limit, skip, sort) =>
	Events.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);

Meteor.publish('eventsForCourse', (courseId: string) => {
	check(courseId, String);

	return Events.find({ courseId, tenant: { $in: visibleTenants() } });
});

Meteor.publish('affectedReplica', (eventId: string) => {
	check(eventId, String);

	const event = Events.findOne({
		_id: eventId,
		tenant: {
			$in: visibleTenants(),
		},
	});
	if (!event) {
		throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
	}
	return Events.find(AffectedReplicaSelectors(event));
});
