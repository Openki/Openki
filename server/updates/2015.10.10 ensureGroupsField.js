import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// Ensure no null groups in events
// eslint-disable-next-line func-names
UpdatesAvailable.ensureGroupsFields = function () {
	return Events.update({ groups: null }, { groups: [] });
};
