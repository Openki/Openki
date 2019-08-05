import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';

const UpdatesAvailable = [];
// Ensure no null groups in events
// eslint-disable-next-line func-names
UpdatesAvailable.ensureInternalField = function () {
	return Events.update({ internal: null }, { $set: { internal: false } }, { multi: true })
		+ Courses.update({ internal: null }, { $set: { internal: false } }, { multi: true });
};
