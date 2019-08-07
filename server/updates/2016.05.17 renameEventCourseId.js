import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable.renameEventCourseId = function () {
	let updated = 0;

	Events.find({}).fetch().forEach((originalEvent) => {
		const event = {};
		Object.assign(event, originalEvent);
		event.courseId = event.course_id;
		delete event.course_id;
		updated += Events.update(event._id, event);
	});

	return updated;
};
