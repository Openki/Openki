import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

import { EventEntity, Events } from '/imports/api/events/events';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';
import * as StringTools from '/imports/utils/string-tools';
import { Geodata } from '/imports/api/regions/regions';
import { UserModel } from '/imports/api/users/users';

/** DB-Model */
export interface VenueEntity {
	/** ID */
	_id: string;
	/** user ID */
	editor: string;
	name: string;
	slug: string;
	/** HTML */
	description: string;
	/** ID */
	region?: string;
	loc?: Geodata;
	address: string;
	route: string;
	/** ID */
	short: string;
	/** Int */
	maxPeople: number;
	/** Int */
	maxWorkplaces: number;
	/** For keys see: Venues.facilityOptions */
	facilities: {
		[key: string]: string;
	};
	otherFacilities?: string;
	createdby: string;
	created: Date;
	updated: Date;
}

export type VenueModel = Venue & VenueEntity;

/**
 * Venue objects represent locations where events take place.
 */
export class Venue {
	public facilities = {};

	/**
	 * Check whether a user may edit the venue.
	 */
	editableBy(this: VenueModel, user: UserModel | undefined | null) {
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

export interface FindFilter {
	/** string of words to search for */
	search?: string;
	/** restrict to venues in that region */
	region?: string;
	editor?: string;
	recent?: boolean;
}

export class VenueCollection extends Mongo.Collection<VenueEntity, VenueModel> {
	facilityOptions = [
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

	constructor() {
		super('Venues', {
			transform(venue) {
				return _.extend(new Venue(), venue);
			},
		});

		if (Meteor.isServer) {
			this.createIndex({ region: 1 });
			this.createIndex({ loc: '2dsphere' });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({ region: Predicates.id });
	}

	/**
	 * Find venues for given filters
	 * @param filter dictionary with filter options
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 */
	findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort?: [string, 'asc' | 'desc'][]) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<VenueEntity> = {};

		const options: Mongo.Options<VenueEntity> = { sort };

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
			const findRecent: Mongo.Selector<EventEntity> = {
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

			find._id = { $in: recentLocations as string[] };
		}

		return this.find(find, options);
	}
}

export const Venues = new VenueCollection();

export default Venues;
