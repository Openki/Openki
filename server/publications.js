"use strict";

Meteor.publish ('courses', function(region){
	if(!region) {
		return Courses.find();
	} else {
		return Courses.find({region: region});
	}
});

Meteor.publish ('courseDetails', function(id) {
	return Courses.find({ _id: id });
});

Meteor.publish ('coursesFind', coursesFind);

Meteor.publish ('roles', function(){
	return Roles.find();
});

Meteor.publish ('regions', function(){
	return Regions.find();
});


/////////////////////////////////////////////////// locations
Meteor.publish ('locations', function(region) {
	check(region, String);
	var find = {};
	if (region != 'all') find.region = region
	return Locations.find(find);
});

Meteor.publish ('locationNames', function(region) {
	var find = {};
	if (region != 'all' && region != undefined) find.region = region
	return Locations.find(find);
});

Meteor.publish ('locationDetails', function(id) {
	return Locations.find(id);
});



Meteor.publish('discussion', function(courseId) {
	return CourseDiscussions.find({ course_ID: courseId });
});


Meteor.publish('events', function(region) {
	if(!region) {
		return Events.find();
	} else {
		return Events.find({region: region});
	}
});

Meteor.publish('event', function(eventId) {
	return Events.find({ _id: eventId });
});

Meteor.publish ('eventsFind', eventsFind);

Meteor.publish('eventsForCourse', function(courseId) {
	return Events.find({course_id: courseId});
});

Meteor.publish('affectedReplica', function(eventId) {
	var event = Events.findOne(eventId);
	if (!event) throw new Meteor.Error(400, "provided event id "+eventId+" is invalid");
	return Events.find(affectedReplicaSelectors(event));
});


Meteor.publish('user', function(userId) {
	var fields = {username: 1};
	
	// Admins may see other's privileges
	if (privileged(Meteor.users.findOne(this.userId), 'admin')) fields.privileges = 1;

	return Meteor.users.find(
		{ _id: userId },
		{ fields: fields }
	);
});

Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId);
});

Meteor.publish('groupsFind', function(filter) {
	// Filter function on the server doesn't have access to current user ID
	if (filter.own) {
		delete filter.own;
		filter.user = this.userId;
	}
	return groupsFind(filter);
});

Meteor.publish('group', function(groupId) {
	return Groups.find(groupId);
});