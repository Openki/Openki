import Courses from '/imports/api/courses/courses';

const UpdatesAvailable = [];

UpdatesAvailable.ensureGroupOrganizersField = function () {
	return Courses.update(
		{ groupOrganizers: null },
		{ $set: { groupOrganizers: [] } },
		{ multi: true },
	);
};
