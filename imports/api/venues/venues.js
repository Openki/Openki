import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import Filtering from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';
import StringTools from '/imports/utils/string-tools';

// ======== DB-Model: ========
/**
 * @typedef  {Object} VenueEnity
 * @property {string} [_id]             ID
 * @property {string} [editor]          user ID
 * @property {string} [name]
 * @property {string} [slug]
 * @property {string} [description]     HTML
 * @property {string} [region]          ID
 * @property {{ type: 'Point', coordinates: [number, number] }} [loc] GeoJSON coordinates
 * (Longitude, Latitude)
 * @property {string} [address]
 * @property {string} [route]
 *
 * Additional information
 * @property {string} [short]           ID
 * @property {number} [maxPeople]       Int
 * @property {number} [maxWorkplaces]   Int
 * @property {{[key: string]: string}} [facilities] For keys see: Venues.facilityOptions
 * @property {string} [otherFacilities]
 * @property {string} [website]         URL
 *
 * @property {string} [createdby]
 * @property {Date}   [created]
 * @property {Date}   [updated]
 */

/** Venue objects represent locations where events take place.
  */
export const Venue = function () {
	this.facilities = {};
};

/** Check whether a user may edit the venue.
  * @this {VenueEnity}
  * @param {object} user
  * @return {boolean}
  */
Venue.prototype.editableBy = function (user) {
	if (!user) {
		return false;
	}
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

if (Meteor.isServer) {
	Venues._ensureIndex({ loc: '2dsphere' });
}

Venues.Filtering = () => Filtering(
	{ region: Predicates.id },
);


Venues.facilityOptions = ['projector', 'screen', 'audio', 'blackboard', 'whiteboard',
	'flipchart', 'wifi', 'kitchen', 'wheelchairs',
];

/**
 * Find venues for given filters
 * @param {object} filter dictionary with filter options
 * @param {string} filter.search string of words to search for
 * @param {string} filter.region restrict to venues in that region
 * @param {number} limit how many to find
 * @param {number} skip
 * @param {*} sort
 */
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
		find.$and = _.map(searchTerms, (searchTerm) => ({ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } }));
	}

	return Venues.find(find, options);
};

export default Venues;
