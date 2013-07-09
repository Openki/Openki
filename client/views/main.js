Template.maincontent.loadcourse = function() {
	console.log("loadin course "+Session.get('selected_course'))
	return Courses.findOne(Session.get('selected_course'))
}