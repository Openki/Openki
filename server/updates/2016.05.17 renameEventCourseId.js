// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
import { Events } from '/imports/api/events/events';

const UpdatesAvailable = [];

UpdatesAvailable.renameEventCourseId = function () {
	let updated = 0;

	Events.find({}).fetch().forEach((originalEvent) => {
		const event = { ...originalEvent };
		event.courseId = event.course_id;
		delete event.course_id;
		updated += Events.update(event._id, event);
	});

	return updated;
};
*/
