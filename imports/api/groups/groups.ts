import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Filtering } from '/imports/utils/filtering';
import * as FileStorage from '/imports/utils/FileStorage';

/** DB-Model */
export interface GroupEntity {
	/** ID */
	_id: string;
	name: string;
	short: string;
	claim: string;
	description: string;
	logoUrl?: string;
	/** List of userIds */
	members: string[];
}
export type GroupModel = Group & GroupEntity;

export class Group {
	publicLogoUrl(this: GroupModel) {
		if (!this.logoUrl) {
			return '';
		}

		return FileStorage.generatePublicUrl(this.logoUrl);
	}
}

export class GroupsCollection extends Mongo.Collection<GroupEntity, GroupModel> {
	constructor() {
		super('Groups', {
			transform(tenant) {
				return _.extend(new Group(), tenant);
			},
		});

		if (Meteor.isServer) {
			this.createIndex({ members: 1 });
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
