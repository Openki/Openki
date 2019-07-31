import Courses from '/imports/api/courses/courses';

const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable.ensureGroupOrganizersField = function () {
	return Courses.update(
		{ groupOrganizers: null },
		{ $set: { groupOrganizers: [] } },
		{ multi: true },
	);
};
