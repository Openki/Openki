UpdatesAvailable.ensureGroupOrganizersField = function() {
	return Courses.update({ groupOrganizers: null }, { $set: { groupOrganizers: [] } }, { multi: true });
};