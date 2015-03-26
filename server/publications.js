"use strict";

Meteor.publish ('courses', function(region){
	if(!region) return Courses.find();
				return Courses.find({region: region});
});

Meteor.publish ('courseDetails', function(id) {
	return Courses.find({ _id: id });
});

Meteor.publish ('coursesFind', coursesFind);

Meteor.publish ('categories', function(){
	return Categories.find();
});

Meteor.publish ('roles', function(){
	return Roles.find();
});

Meteor.publish ('regions', function(){
	return Regions.find();
});

Meteor.publish ('locations', function(region) {
	var find = {}
	if (region != 'all') find.region = region
	return Locations.find(find);
});

Meteor.publish('discussion', function(courseId) {
	return CourseDiscussions.find({ course_ID: courseId });
});


Meteor.publish('events', function(region) {
	if(!region) return Events.find();
			   return Events.find({region: region});
});

Meteor.publish('event', function(eventId) {
	return Events.find({ _id: eventId });
});

Meteor.publish ('eventsFind', eventsFind);

Meteor.publish('eventsForCourse', function(courseId) {
	return Events.find({course_id: courseId});
});

Meteor.publish('futureEvents', function() {
	return Events.find({startdate: {$gt: new Date()}});
});

Meteor.publish('nextEvent', function(courseId) {
	return Events.find({ course_id: courseId });
});

Meteor.publish ('users', function(){
	return Meteor.users.find({}, {
		fields: {username: 1}
	});

});

Meteor.publish('user', function(userId) {
	return Meteor.users.find(
		{ _id: userId },
		{ fields: {username: 1} }
	);
});

Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId);
});

Meteor.publish ('groups', function(){
	return Groups.find();
});