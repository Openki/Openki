//Meteor.subscribe('courses', Session.get('region'))
Meteor.subscribe('categories');
Meteor.subscribe('comments');
Meteor.subscribe('courses', function onComplete() {
  Session.set('coursesLoaded', true);
});
Meteor.subscribe('discussions');
Meteor.subscribe('locations');
Meteor.subscribe('messages');
Meteor.subscribe('regions');
Meteor.subscribe('roles');
Meteor.subscribe('votings');


Template.maincontent.loadcourse = function() {
	return Courses.findOne(Session.get('selected_course'))
}