import '/imports/collections/Log.js';

Meteor.publish('version', function() {
	return Version.find();
});

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

Meteor.publish  ('coursesFind', coursesFind);

Meteor.publish ('regions', function(){
	return Regions.find();
});


Meteor.publish ('venues', function(region) {
	check(region, Match.Maybe(String));
	var find = {};
	if (region) find.region = region;
	return Venues.find(find);
});

Meteor.publish ('venueDetails', function(id) {
	return Venues.find(id);
});

Meteor.publish('venuesFind', function(find, limit) {
	return venuesFind(find, limit);
});


Meteor.publish('discussion', function(courseId) {
	return CourseDiscussions.find({ courseId: courseId });
});


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

Meteor.publish ('eventsFind', eventsFind);

Meteor.publish('eventsForCourse', function(courseId) {
	return Events.find({courseId: courseId});
});

Meteor.publish('affectedReplica', function(eventId) {
	var event = Events.findOne(eventId);
	if (!event) throw new Meteor.Error(400, "provided event id "+eventId+" is invalid");
	return Events.find(affectedReplicaSelectors(event));
});


Meteor.publish('user', function(userId) {
	var fields =
		{ 'username': 1
		, 'acceptsMessages': 1
		};

	// Admins may see other's privileges
	if (privileged(Meteor.users.findOne(this.userId), 'admin')) fields.privileges = 1;

	return Meteor.users.find(
		{ _id: userId },
		{ fields: fields }
	);
});


// Always publish their own data for logged-in users
// https://github.com/meteor/guide/issues/651
Meteor.publish(null, function() {
	return Meteor.users.find(this.userId);
});

Meteor.publish('userSearch', function(search) {
	check(search, String);
	return UserLib.searchPrefix(search, { fields: { username: 1 }, limit: 10 });
});

Meteor.publish('groupsFind', function(filter) {
	// Filter function on the server doesn't have access to current user ID
	if (filter.own) {
		delete filter.own;
		filter.user = this.userId;
	}
	return GroupLib.find(filter);
});

Meteor.publish('group', function(groupId) {
	return Groups.find(groupId);
});


Meteor.publish('log', function(filter, limit) {
	// Non-admins get an empty list
	if (!privileged(this.userId, 'admin')) {
		return [];
	}

	return Log.findFilter(filter, limit);
});
