import { Meteor } from 'meteor/meteor';

import Events from '../events.js';

import AffectedReplicaSelectors from '/imports/utils/affected-replica-selectors.js';

Meteor.publish('events', function(region) {
	if(!region) {
		return Events.find();
	} else {
		return Events.find({region: region});
	}
});

Meteor.publish('event', function(eventId) {
	check(eventId, String);
	return Events.find(eventId);
});

Meteor.publish ('Events.findFilter', Events.findFilter);

Meteor.publish('eventsForCourse', function(courseId) {
	return Events.find({courseId: courseId});
});

Meteor.publish('affectedReplica', function(eventId) {
	var event = Events.findOne(eventId);
	if (!event) throw new Meteor.Error(400, "provided event id "+eventId+" is invalid");
	return Events.find(AffectedReplicaSelectors(event));
});
