UpdatesAvailable.ensureEventGroupOrganizersField = function() {
	return Events.update({ groupOrganizers: null }, { $set: { groupOrganizers: [] } }, { multi: true });
};