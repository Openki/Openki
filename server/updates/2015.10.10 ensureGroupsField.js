// Ensure no null groups in events
UpdatesAvailable.ensureGroupsFields = function() {
	return Events.update({ groups: null }, { groups: [] });
};
