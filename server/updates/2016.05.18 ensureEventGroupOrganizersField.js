import Events from '/imports/api/events/events.js';

UpdatesAvailable.ensureEventGroupOrganizersField = function() {
	return Events.update({ groupOrganizers: null }, { $set: { groupOrganizers: [] } }, { multi: true });
};
