import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Events } from '../events';

import { AffectedReplicaSelectors } from '/imports/utils/affected-replica-selectors';

Meteor.publish('events', (region) => {
	if (!region) {
		return Events.find();
	}
	return Events.find({ region });
});

Meteor.publish('event', (eventId) => {
	check(eventId, String);
	return Events.find(eventId);
});

Meteor.publish('Events.findFilter', (filter, limit, skip, sort) =>
	Events.findFilter(filter, limit, skip, sort),
);

Meteor.publish('eventsForCourse', (courseId) => Events.find({ courseId }));

Meteor.publish('affectedReplica', (eventId) => {
	const event = Events.findOne(eventId);
	if (!event) {
		throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
	}
	return Events.find(AffectedReplicaSelectors(event));
});
