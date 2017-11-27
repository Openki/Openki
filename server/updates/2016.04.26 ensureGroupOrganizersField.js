import Courses from '/imports/api/courses/courses.js';

UpdatesAvailable.ensureGroupOrganizersField = function() {
	return Courses.update({ groupOrganizers: null }, { $set: { groupOrganizers: [] } }, { multi: true });
};
