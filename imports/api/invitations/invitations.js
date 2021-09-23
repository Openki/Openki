import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';
import { Match, check } from 'meteor/check';

/**
 * @typedef {'created' | 'send' | 'accepted' | 'failed'} Status
 */

// ======== DB-Model: ========
/**
 * @typedef {Object} InvitationEntity
 * @property {string} _id ID
 * @property {string} tenant tenant id
 * @property {string} to
 * @property {string} token
 * @property {Status} status
 * @property {string} [acceptedBy] The user who has accepted the invitation. (by state 'accepted')
 * @property {Date} createdAt
 * @property {string} createdBy user id
 */

/**
 * @extends {Mongo.Collection<InvitationEntity>}
 */
export class InvitationsCollection extends Mongo.Collection {
	constructor() {
		super('Invitations');

		if (Meteor.isServer) {
			this._ensureIndex({ tenant: 1 });
			this._ensureIndex({ token: 1, to: 1 });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({
			status: Predicates.ids,
		});
	}

	/**
	 * @param {{
	 * tenant?: string;
	 * status?: Status[];
	 * }} [filter]
	 * @param {number} [limit] how many to find
	 * @param {number} [skip] skip this many before returning results
	 * @param {[string, 'asc' | 'desc'][]} [sort] list of fields to sort by
	 */
	findFilter(filter = {}, limit = 0, skip = 0, sort) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		/** @type {Mongo.Selector<InvitationEntity>} */
		const find = {};
		/** @type {Mongo.Options<InvitationEntity>} */
		const options = {};
		const order = sort || [];

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.tenant) {
			find.tenant = filter.tenant;
		}

		if (filter.status && filter.status.length > 0) {
			find.status = { $in: filter.status };
		}

		order.push(['createdAt', 'desc']);

		options.sort = order;

		return this.find(find, options);
	}
}

export const Invitations = new InvitationsCollection();

export default Invitations;
