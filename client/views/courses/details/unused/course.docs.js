Template.coursedocs.helpers({
	eventsWithFiles: function() {
		var withFiles = {course_id: this.course._id, files: {$exists: 1, $not: {$size: 0}}};
		return Events.find(withFiles, {sort: {start: 1}});
	}
});
