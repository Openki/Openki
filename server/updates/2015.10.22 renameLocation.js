import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// The location field becomes an object
// eslint-disable-next-line func-names
UpdatesAvailable.renameLocationName = function () {
	Events.find({}).fetch().forEach((event) => {
		if (typeof event.location === 'string') {
			// eslint-disable-next-line no-param-reassign
			event.location = { name: event.location };

			Events.update(event._id, event);
		}
	});
};
