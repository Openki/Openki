import Events from '/imports/api/events/events.js';

// Ensure no null groups in events
UpdatesAvailable.ensureGroupsFields = function() {
	return Events.update({ groups: null }, { groups: [] });
};
