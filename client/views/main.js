Template.maincontent.loadcourse = function() {
	return Courses.findOne(Session.get('selected_course'))
}