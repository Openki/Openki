import { Meteor } from 'meteor/meteor';

import Venues from '../venues';

Meteor.publish('venues', (region) => {
	check(region, Match.Maybe(String));
	const find = {};
	if (region) {
		find.region = region;
	}
	return Venues.find(find);
});

Meteor.publish('venueDetails', (id) => Venues.find(id));

Meteor.publish('Venues.findFilter', (find, limit) => Venues.findFilter(find, limit));
