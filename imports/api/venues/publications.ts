import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { FindFilter, VenueEntity, Venues } from '/imports/api/venues/venues';

import { ServerPublish } from '/imports/utils/ServerPublish';

export const all = ServerPublish('venues', (region?: string) => {
	check(region, Match.Maybe(String));

	const find: Mongo.Selector<VenueEntity> = {};
	if (region) {
		find.region = region;
	}
	return Venues.find(find);
});

export const details = ServerPublish(
	'venueDetails',
	(id: string) => {
		check(id, String);

		return Venues.find(id);
	},
	(id: string) => Venues.findOne(id),
);

export const findFilter = ServerPublish('Venues.findFilter', (find?: FindFilter, limit?: number) =>
	Venues.findFilter(find, limit),
);
