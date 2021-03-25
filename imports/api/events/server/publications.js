import { Meteor } from 'meteor/meteor';

import Events from '../events';

import AffectedReplicaSelectors from '/imports/utils/affected-replica-selectors';

Meteor.publish('events', (region) => {
	if (!region) {
		return Events.find({ tenant: { $in: Meteor.user()?.visibleTenants() || [] } });
	}
	return Events.find({ region, tenant: { $in: Meteor.user()?.visibleTenants() || [] } });
});

Meteor.publish('event', (eventId) => {
	check(eventId, String);
	return Events.find({ _id: eventId, tenant: { $in: Meteor.user()?.visibleTenants() || [] } });
});

Meteor.publish('Events.findFilter', (filter, limit, skip, sort) => Events.findFilter(filter, limit, skip, sort));

Meteor.publish('eventsForCourse', (courseId) => Events.find({ courseId, tenant: { $in: Meteor.user()?.visibleTenants() || [] } }));

Meteor.publish('affectedReplica', (eventId) => {
	const event = Events.findOne({
		_id: eventId,
		tenant: {
			$in: Meteor.user()?.visibleTenants() || [],
		},
	});
	if (!event) {
		throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
	}
	return Events.find(AffectedReplicaSelectors(event));
});
