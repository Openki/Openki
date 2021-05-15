import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Venues } from '../venues';

Meteor.publish(
	'venues',
	/** @param {string} [region] */ (region) => {
		check(region, Match.Maybe(String));
		const find = {};
		if (region) {
			find.region = region;
		}
		return Venues.find(find);
	},
);

Meteor.publish('venueDetails', (id) => Venues.find(id));

Meteor.publish('Venues.findFilter', (find, limit) => Venues.findFilter(find, limit));
