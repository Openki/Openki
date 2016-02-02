// Rename event fields startdate and enddate to start and end
// Also fix the end date so the date is not on some random future day
// Somehow the enddate got corrupted and for the current data we can fix it by just resetting the day
UpdatesAvailable.renameEventFields = function() {
	Events.find({}).fetch().forEach(function(event) {
		if (event.startdate) {
			event.start = event.startdate;
			delete event.startdate;
		}
		if (event.enddate) {
			event.end = event.enddate;
			delete event.enddate;
		}

		event.end.setMonth(event.start.getMonth());
		event.end.setDate(event.start.getDate());

		Events.update(event._id, event);
	});
};