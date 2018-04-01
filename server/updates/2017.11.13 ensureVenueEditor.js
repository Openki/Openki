import Venues from '/imports/api/venues/venues.js';

UpdatesAvailable['2017.11.13 ensureVenueEditor'] = function() {
	return Venues.update(
		{ editor: { $exists: false } },
		{ $set: { editor: null } },
		{ multi: true }
	);
};
