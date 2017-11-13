import { Meteor } from 'meteor/meteor';

UpdatesAvailable['2017.11.13 ensureVenueEditor'] = function() {
	return Venues.update(
		{ editor: { $exists: false } },
		{ $set: { editor: null } },
		{ multi: true }
	);
};
