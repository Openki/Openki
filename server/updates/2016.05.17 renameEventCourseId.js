import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

UpdatesAvailable.renameEventCourseId = function () {
	let updated = 0;

	Events.find({}).fetch().forEach((event) => {
		// eslint-disable-next-line no-param-reassign
		event.courseId = event.course_id;
		// eslint-disable-next-line no-param-reassign
		delete event.course_id;
		updated += Events.update(event._id, event);
	});

	return updated;
};
