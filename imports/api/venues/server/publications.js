import { Meteor } from 'meteor/meteor';

import Venues from '../venues.js';

Meteor.publish ('venues', function(region) {
	check(region, Match.Maybe(String));
	var find = {};
	if (region) find.region = region;
	return Venues.find(find);
});

Meteor.publish ('venueDetails', function(id) {
	return Venues.find(id);
});

Meteor.publish('Venues.findFilter', function(find, limit) {
	return Venues.findFilter(find, limit);
});
