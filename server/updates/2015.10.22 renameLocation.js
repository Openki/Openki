// The location field becomes an object
UpdatesAvailable.renameLocationName = function() {
	Events.find({}).fetch().forEach(function(event) {
		if (typeof event.location === "string") {
			event.location = { name: event.location };

			Events.update(event._id, event);
		}
	});
};