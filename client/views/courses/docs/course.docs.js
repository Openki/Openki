eventsWithFiles = function(courseId) {
	var withFiles = { courseId: courseId, files: {$exists: 1, $not: {$size: 0}} };
	return Events.find(withFiles, {sort: {start: 1}});
};

Template.coursedocs.helpers({
	hasFiles: function() {
		return eventsWithFiles(this.course._id).count() > 0;
	},

	eventsWithFiles: function() {
		return eventsWithFiles(this.course._id);
	}
});
