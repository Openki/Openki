import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';
import { Match, check } from 'meteor/check';

export type Status = 'created' | 'send' | 'accepted' | 'failed';

/** DB-Model */
export interface InvitationEntity {
	/** ID */
	_id: string;
	/** tenant id */
	tenant: string;
	to: string;
	token: string;
	status: Status;
	/** The user who has accepted the invitation. (by state 'accepted') */
	acceptedBy?: string;
	createdAt: Date;
	/** user id */
	createdBy: string;
}

export class InvitationsCollection extends Mongo.Collection<InvitationEntity> {
	constructor() {
		super('Invitations');

		if (Meteor.isServer) {
			this.createIndex({ tenant: 1 });
			this.createIndex({ token: 1, to: 1 });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({
			status: Predicates.ids,
		});
	}

	/**
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 */
	findFilter(
		filter: {
			tenant?: string;
			status?: Status[];
		} = {},
		limit = 0,
		skip = 0,
		sort?: [string, 'asc' | 'desc'][],
	) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<InvitationEntity> = {};
		const options: Mongo.Options<InvitationEntity> = {};
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
