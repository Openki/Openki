// The location field gets renamed to locationName to avoid confusion when locationId is introduced
UpdatesAvailable.renameLocationName = function() {
	Events.find({}).fetch().forEach(function(event) {
		if (event.location) {
			event.locationName = event.location;
			delete event.location;

			Events.update(event._id, event);
		}
	})
}