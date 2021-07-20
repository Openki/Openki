import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

import { Events } from '/imports/api/events/events';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Filtering } from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';
import * as StringTools from '/imports/utils/string-tools';

/** @typedef {import('../users/users').UserModel} UserModel */

// ======== DB-Model: ========
/**
 * @typedef  {Object} VenueEnity
 * @property {string} _id             ID
 * @property {string} editor          user ID
 * @property {string} name
 * @property {string} slug
 * @property {string} description     HTML
 * @property {string|null} region     ID
 * @property {{ type: 'Point', coordinates: [number, number] }} [loc] GeoJSON coordinates
 * (Longitude, Latitude)
 * @property {string} address
 * @property {string} route
 *
 * Additional information
 * @property {string} short           ID
 * @property {number} maxPeople       Int
 * @property {number} maxWorkplaces   Int
 * @property {{[key: string]: string}} facilities For keys see: Venues.facilityOptions
 * @property {string} [otherFacilities]
 * @property {string} [website]         URL
 *
 * @property {string} createdby
 * @property {Date}   created
 * @property {Date}   updated
 */

/**
 * @typedef {Venue & VenueEnity} VenueModel
 */

/**
 * Venue objects represent locations where events take place.
 */
export class Venue {
	constructor() {
		this.facilities = {};
	}

	/**
	 * Check whether a user may edit the venue.
	 * @this {VenueModel}
	 * @param {UserModel} user
	 */
	editableBy(user) {
		if (!user) {
			return false;
		}
		const isNew = !this._id;
		return (
			isNew /* Anybody may create a new location */ ||
			user._id === this.editor ||
			UserPrivilegeUtils.privileged(user, 'admin') // Admins can edit all venues
		);
	}
}

/**
 * @extends {Mongo.Collection<VenueEnity, VenueModel>}
 */
export class VenueCollection extends Mongo.Collection {
	constructor() {
		super('Venues', {
			transform(venue) {
				return _.extend(new Venue(), venue);
			},
		});

		if (Meteor.isServer) {
			this._ensureIndex({ region: 1 });
			this._ensureIndex({ loc: '2dsphere' });
		}

		this.facilityOptions = [
			'projector',
			'screen',
			'audio',
			'blackboard',
			'whiteboard',
			'flipchart',
			'wifi',
			'kitchen',
			'wheelchairs',
		];
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({ region: Predicates.id });
	}

	/**
	 * Find venues for given filters
	 * @param {object} [filter] dictionary with filter options
	 * @param {string} [filter.search] string of words to search for
	 * @param {string} [filter.region] restrict to venues in that region
	 * @param {string} [filter.editor]
	 * @param {boolean} [filter.recent]
	 * @param {number} [limit] how many to find
	 * @param {number} [skip] skip this many before returning results
	 * @param {[string, 'asc' | 'desc'][]} [sort] list of fields to sort by
	 */
	findFilter(filter = {}, limit = 0, skip = 0, sort) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		/** @type {Mongo.Selector<VenueEnity> } */
		const find = {};

		/** @type {Mongo.Options<VenueEnity>} */
		const options = { sort };

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.editor) {
			find.editor = filter.editor;
		}

		if (filter.region) {
			find.region = filter.region;
		}

		if (filter.search) {
			const searchTerms = filter.search.split(/\s+/);
			find.$and = searchTerms.map((searchTerm) => ({
				name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' },
			}));
		}

		if (filter.recent) {
			const findRecent = {
				'venue._id': { $exists: true },
			};
			if (filter.region) {
				findRecent.region = filter.region;
			}
			const findRecentOptions = {
				sort: { time_lastedit: -1 },
				limit: (limit || 10) * 1.5, // Get more so after distinct/uniq we reach the limit
				fields: { 'venue._id': 1 },
			};

			const recentEvents = Events.find(findRecent, findRecentOptions).fetch();

			const recentLocations = [
				...new Set(
					recentEvents
						.map((event) => event.venue?._id) // get ids
						.filter((venueId) => venueId), // filter empty ids
				),
			] // make unique with Set
				.slice(0, limit || 10); // and limit it

			find._id = { $in: recentLocations };
		}

		return this.find(find, options);
	}
}

export const Venues = new VenueCollection();

export default Venues;
