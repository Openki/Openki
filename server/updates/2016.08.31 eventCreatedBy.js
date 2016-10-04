UpdatesAvailable['2016.08.31 eventCreatedBy'] = function() {
	return Events.update({}, { $rename: { 'createdby': 'createdBy' } }, { multi: true });
};