import Courses from '/imports/api/courses/courses.js';
import Events from '/imports/api/events/events.js';

// Ensure no null groups in events
UpdatesAvailable.ensureInternalField = function() {
	return Events.update({ internal: null }, { $set: { internal: false } }, { multi: true })
	     + Courses.update({ internal: null }, { $set: { internal: false } }, { multi: true });
};
