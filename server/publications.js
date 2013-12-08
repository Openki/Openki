//  use when autopublish removed: (regions)

Meteor.publish ('courses', function(region){
	if(!region) return Courses.find();
	return Courses.find({region: region});
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

Meteor.publish ('locations', function(){
	return Locations.find();
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
