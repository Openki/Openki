import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { FindFilter, VenueEntity, Venues } from '/imports/api/venues/venues';

Meteor.publish('venues', (region?: string) => {
	check(region, Match.Maybe(String));

	const find: Mongo.Selector<VenueEntity> = {};
	if (region) {
		find.region = region;
	}
	return Venues.find(find);
});

Meteor.publish('venueDetails', (id: string) => {
	check(id, String);

	return Venues.find(id);
});

Meteor.publish('Venues.findFilter', (find?: FindFilter, limit?: number) =>
	Venues.findFilter(find, limit),
);
