import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { Filtering } from '/imports/utils/filtering';

// ======== DB-Model: ========
/**
 * @typedef {Object} GroupEntity
 * @property {string} _id ID
 * @property {string} name
 * @property {string} short
 * @property {string} claim
 * @property {string} description
 * @property {string[]} members List of userIds
 */

/**
 * @extends {Mongo.Collection<GroupEntity>}
 */
export class GroupsCollection extends Mongo.Collection {
	constructor() {
		super('Groups');
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({});
	}

	/**
	 * Find groups for given filters
	 * @param {object} [filter] dictionary with filter options
	 * @param {boolean} [filter.own] Limit to groups where logged-in user is a member
	 * @param {string|false} [filter.user] Limit to groups where given user ID is a
	 * member (client only)
	 * @param {number} [limit]
	 * @param {number} [skip]
	 * @param {*} [sort]
	 */
	findFilter(filter = {}, limit = 0, skip, sort) {
		const find = {};

		/**
		 * @type {Mongo.Options<GroupEntity>}
		 */
		const options = { skip, sort };

		if (limit > 0) {
			options.limit = limit;
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
