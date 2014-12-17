"use strict";

Meteor.publish ('courses', function(region){
	if(!region) return Courses.find();
				return Courses.find({region: region});
});

Meteor.publish ('courseDetails', function(id){
	return Courses.find({_id: id});
});

Meteor.publish ('coursesFind', coursesFind);

Meteor.publish ('categories', function(){
	return Categories.find();
});

Meteor.publish ('votings', function(){
	return Votings.find();
});

Meteor.publish ('roles', function(){
	return Roles.find();
});

Meteor.publish ('regions', function(){
	return Regions.find();
});

Meteor.publish ('messages', function(){
	return Messages.find();
});

Meteor.publish ('locations', function(region) {
	var find = {}
	if (region != 'all') find.region = region
	return Locations.find(find);
});

Meteor.publish ('discussions', function(){
	return CourseDiscussions.find();
});


Meteor.publish ('events', function(){
	return Events.find();
});


Meteor.publish ('users', function(){
	return Meteor.users.find({}, {
		fields: {username: 1}
	});

});

Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId);
});

Meteor.publish ('groups', function(){
	return Groups.find();
});