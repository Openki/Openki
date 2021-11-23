import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { FindFilter, VenueEntity, Venues } from '../venues';

Meteor.publish('venues', (region?: string) => {
	check(region, Match.Maybe(String));
	const find: Mongo.Selector<VenueEntity> = {};
	if (region) {
		find.region = region;
	}
	return Venues.find(find);
});

Meteor.publish('venueDetails', (id: string) => Venues.find(id));

Meteor.publish('Venues.findFilter', (find?: FindFilter, limit?: number) =>
	Venues.findFilter(find, limit),
);
