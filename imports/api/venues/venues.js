import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';
import Filtering from '/imports/utils/filtering.js';
import Predicates from '/imports/utils/predicates.js';
import StringTools from '/imports/utils/string-tools.js';

// _id          ID
// editor       user ID
// name         String
// description  String (HTML)
// region       region ID
// loc          GeoJSON coordinates
// address      String
// route        String

// Additional information
// short            String
// maxPeople        Int
// maxWorkplaces    Int
// facilities       {facility-key: Boolean}
// otherFacilities  String
// website          URL

/** Venue objects represent locations where events take place.
  */
Venue = function() {
	this.facilities = {};
};

/** Check whether a user may edit the venue.
  *
  * @param {Object} venue
  * @return {Boolean}
  */
Venue.prototype.editableBy = function(user) {
	if (!user) return false;
	var isNew = !this._id;
	return isNew // Anybody may create a new location
		|| user._id === this.editor
		|| UserPrivilegeUtils.privileged(user, 'admin'); // Admins can edit all venues
};

export default Venues = new Mongo.Collection("Venues", {
	transform: function(venue) {
		return _.extend(new Venue(), venue);
	}
});

if (Meteor.isServer) Venues._ensureIndex({loc : "2dsphere"});

Venues.Filtering = () => Filtering(
	{ region: Predicates.id
	}
);


Venues.facilityOptions =
	[ 'projector', 'screen', 'audio', 'blackboard', 'whiteboard'
	, 'flipchart', 'wifi', 'kitchen', 'wheelchairs'
	];

/* Find venues for given filters
 *
 * filter: dictionary with filter options
 *   search: string of words to search for
 *   region: restrict to venues in that region
 * limit: how many to find
 *
 */
Venues.findFilter = function(filter, limit, skip, sort) {
	var find = {};
	const options = { skip, sort };

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		find.$and = _.map(searchTerms, function(searchTerm) {
			return { name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } };
		});
	}

	return Venues.find(find, options);
};
