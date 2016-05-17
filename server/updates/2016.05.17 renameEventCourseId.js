UpdatesAvailable.renameEventCourseId = function() {
	var updated = 0;

	Events.find({}).fetch().forEach(function(event) {
		event.courseId = event.course_id;
		delete event.course_id;
		updated += Events.update(event._id, event);
	});

	return updated;
};