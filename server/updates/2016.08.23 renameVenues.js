import Events from '/imports/api/events/events';
import Venues from '/imports/api/venues/venues';

const UpdatesAvailable = [];

UpdatesAvailable['2016.08.23 renameVenues'] = function () {
	const Locations = new Meteor.Collection('Locations');
	let copied = 0;

	Locations.find().forEach((venue) => {
		Venues.upsert(venue._id, venue);
		copied += 1;
	});

	Locations.rawCollection().drop();

	let modified = 0;

	Events.find({ location: { $exists: true } }).forEach((originalEvent) => {
		const event = { ...originalEvent };
		event.venue = event.location;
		delete event.location;
		modified += Events.update(event._id, event);
	});

	return copied + modified;
};
