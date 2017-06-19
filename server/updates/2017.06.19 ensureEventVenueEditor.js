UpdatesAvailable["2017.06.19 ensureEventVenueEditor"] = function() {
	var count = 0;

	Events.find({ 'venue.editor': null }).forEach(function(event) {
		var venue = event.venue;
		var dbVenue = Venues.findOne(venue._id);

		if (dbVenue.editor) {
			count += 1;
			venue.editor = dbVenue.editor;
			Events.update(
				{ _id: venue._id },
				{ $set: { venue: venue } }
			);
		}
	});

	return count;
};
