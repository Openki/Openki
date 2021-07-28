import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

import { Filtering } from '/imports/utils/filtering';

/** DB-Model */
export interface GroupEntity {
	/** ID */
	_id: string;
	name: string;
	short: string;
	claim: string;
	description: string;
	/** List of userIds */
	members: string[];
}

export class GroupsCollection extends Mongo.Collection<GroupEntity> {
	constructor() {
		super('Groups');

		if (Meteor.isServer) {
			this._ensureIndex({ members: 1 });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({});
	}

	/**
	 * Find groups for given filters
	 * @param filter dictionary with filter options
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 */
	findFilter(
		filter: {
			/** Limit to groups where logged-in user is a member */
			own?: boolean;
		} = {},
		limit = 0,
		skip = 0,
		sort?: [string, 'asc' | 'desc'][],
	) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<GroupEntity> = {};

		const options: Mongo.Options<GroupEntity> = { sort };

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.own) {
			const me = Meteor.userId();
			if (!me) {
				// User is not logged in...
				return [];
			}

			find.members = me;
		}

		return this.find(find, options);
	}
}

export const Groups = new GroupsCollection();

export default Groups;
