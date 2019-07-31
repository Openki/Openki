import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// Rename event fields startdate and enddate to start and end
// Also fix the end date so the date is not on some random future day
// Somehow the enddate got corrupted and for the current data we can fix it by just resetting the
// day
UpdatesAvailable.renameEventFields = function () {
	Events.find({}).fetch().forEach((event) => {
		if (event.startdate) {
			// eslint-disable-next-line no-param-reassign
			event.start = event.startdate;
			// eslint-disable-next-line no-param-reassign
			delete event.startdate;
		}
		if (event.enddate) {
			// eslint-disable-next-line no-param-reassign
			event.end = event.enddate;
			// eslint-disable-next-line no-param-reassign
			delete event.enddate;
		}

		event.end.setMonth(event.start.getMonth());
		event.end.setDate(event.start.getDate());

		Events.update(event._id, event);
	});
};
