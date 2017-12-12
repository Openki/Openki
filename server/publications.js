import '/imports/collections/Log.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

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
	return Events.find(affectedReplicaSelectors(event));
});

Meteor.publish('log', function(filter, limit) {
	// Non-admins get an empty list
	if (!UserPrivilegeUtils.privileged(this.userId, 'admin')) {
		return [];
	}

	return Log.findFilter(filter, limit);
});
