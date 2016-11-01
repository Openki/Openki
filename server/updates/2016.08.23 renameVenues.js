UpdatesAvailable["2016.08.23 renameVenues"] = function() {
	var Locations = new Meteor.Collection("Locations");
	var copied = 0;

	Locations.find().forEach(function(venue) {
		Venues.upsert(venue._id, venue);
		copied += 1;
	});

	Locations.rawCollection().drop();

	modified = 0;

	Events.find({ location: {$exists: true} }).forEach(function(event) {
		event.venue = event.location;
		delete event.location;
		modified += Events.update(event._id, event);
	});

	return copied + modified;
};