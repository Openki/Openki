import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import Filtering from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';
import StringTools from '/imports/utils/string-tools';

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
const Venue = function () {
	this.facilities = {};
};

/** Check whether a user may edit the venue.
  *
  * @param {Object} venue
  * @return {Boolean}
  */
// eslint-disable-next-line func-names
Venue.prototype.editableBy = function (user) {
	if (!user) return false;
	const isNew = !this._id;
	return isNew // Anybody may create a new location
		|| user._id === this.editor
		|| UserPrivilegeUtils.privileged(user, 'admin'); // Admins can edit all venues
};

const Venues = new Mongo.Collection('Venues', {
	transform(venue) {
		return _.extend(new Venue(), venue);
	},
});

if (Meteor.isServer) Venues._ensureIndex({ loc: '2dsphere' });

Venues.Filtering = () => Filtering(
	{ region: Predicates.id },
);


Venues.facilityOptions = ['projector', 'screen', 'audio', 'blackboard', 'whiteboard',
	'flipchart', 'wifi', 'kitchen', 'wheelchairs',
];

/* Find venues for given filters
 *
 * filter: dictionary with filter options
 *   search: string of words to search for
 *   region: restrict to venues in that region
 * limit: how many to find
 *
 */
// eslint-disable-next-line func-names
Venues.findFilter = function (filter, limit, skip, sort) {
	const find = {};
	const options = { skip, sort };

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.search) {
		const searchTerms = filter.search.split(/\s+/);
		find.$and = _.map(searchTerms, searchTerm => ({ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } }));
	}

	return Venues.find(find, options);
};

export default Venues;
