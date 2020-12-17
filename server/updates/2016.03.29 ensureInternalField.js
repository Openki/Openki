// Legacy: This file is no longer relevant, it is only used for documentation purposes.

/*
import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';

const UpdatesAvailable = [];
// Ensure no null groups in events
UpdatesAvailable.ensureInternalField = function () {
	return Events.update({ internal: null }, { $set: { internal: false } }, { multi: true })
		+ Courses.update({ internal: null }, { $set: { internal: false } }, { multi: true });
};
*/
