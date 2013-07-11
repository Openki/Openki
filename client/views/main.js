Meteor.subscribe('courses', Session.get('region'))


Template.maincontent.loadcourse = function() {
	return Courses.findOne(Session.get('selected_course'))
}