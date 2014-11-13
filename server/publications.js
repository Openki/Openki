"use strict";

Meteor.publish ('courses', function(region){
	if(!region) return Courses.find();
	return Courses.find({region: region});
});

Meteor.publish ('coursesFind', function(region, query, filter){
	var find = {}
	if (region != 'all') find.region = region
	if (filter.hasUpcomingEvent) {
		var future_events = Events.find({startdate: {$gt: new Date()}}).fetch()
		var course_ids_with_future_events = _.pluck(future_events, 'course_id')
		find._id = { $in: _.uniq(course_ids_with_future_events) }
	}
	if (query) {
		var searchTerms = query.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ name: { $regex: escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] }
		});

		find.$and = searchQueries;
	}
	var options = { limit: 40, sort: {time_lastedit: -1, time_created: -1} };
	return Courses.find(find, options);
});

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

/*
Meteor.publish ('comments', function(){
	return CourseComments.find();
});
*/

//tried this, for publishing the users
Meteor.publish ('users', function(){
	return Meteor.users.find({}, {
		fields: {username: 1}
	});

});

Meteor.publish('currentUser', function() {
  var user = Meteor.users.find(this.userId);
  return user;
});
