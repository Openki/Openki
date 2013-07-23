//Meteor.subscribe('courses', Session.get('region'))
Meteor.subscribe('courses', function onComplete() {
  Session.set('coursesLoaded', true);
});
//Meteor.subscribe('courses', Session.set('coursesLoaded', true));


Template.maincontent.loadcourse = function() {
	return Courses.findOne(Session.get('selected_course'))
}