import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import Filtering from '/imports/utils/filtering';

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
		return new Filtering(
			{},
		);
	}

	/**
	 * Find groups for given filters
	 * @param {object} filter dictionary with filter options
	 * @param {boolean} [filter.own] Limit to groups where logged-in user is a member
	 * @param {string|false} [filter.user] Limit to groups where given user ID is a
	 * member (client only)
	 * @param {number} limit
	 * @param {number} skip
	 */
	findFilter(filter, limit, skip, sort) {
		const find = {};

		const options = { skip, sort };

		if (limit > 0) {
			options.limit = limit;
		}

		if (filter.own) {
			const me = Meteor.userId();
			if (!me) return []; // I don't exist? How could I be in a group?!

			find.members = me;
		}

		// If the property is set but falsy, we don't return anything
		if (Object.prototype.hasOwnProperty.call(filter, 'user')) {
			if (!filter.user) {
				return [];
			}
			find.members = filter.user;
		}

		return this.find(find, options);
	}
}

export default new GroupsCollection();
