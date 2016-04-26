UpdatesAvailable.ensureGroupEditorsField = function() {
	return Courses.update({ groupEditors: null }, { $set: { groupEditors: [] } }, { multi: true });
};