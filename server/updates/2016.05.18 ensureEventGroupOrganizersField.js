import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable.ensureEventGroupOrganizersField = function () {
	return Events.update(
		{ groupOrganizers: null },
		{ $set: { groupOrganizers: [] } },
		{ multi: true },
	);
};
