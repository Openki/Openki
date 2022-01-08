import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Filtering } from '/imports/utils/filtering';
import { UserModel } from '/imports/api/users/users';

/** DB-Model */

export interface TenantEntity {
	/** ID */
	_id: string;
	name: string;
	/** List of userIds */
	members: string[];
	/** List of tenant admins */
	admins: string[];
}

export type TenantModel = Tenant & TenantEntity;

export class Tenant {
	/**
	 * Check whether a user may edit the tenant.
	 */
	editableBy(this: TenantModel, user: UserModel | undefined | null) {
		if (!user) {
			return false;
		}

		return (
			UserPrivilegeUtils.privileged(user, 'admin') /* Admins can edit all regions */ ||
			user.isTenantAdmin(this._id) /* or admins of a tenant */
		);
	}
}

export class TenantsCollection extends Mongo.Collection<TenantEntity, TenantModel> {
	constructor() {
		super('Tenants', {
			transform(tenant) {
				return _.extend(new Tenant(), tenant);
			},
		});
	}

	// eslint-disable-next-line class-methods-use-this
	get publicFields() {
		return {
			_id: 1,
			name: 1,
			members: 1,
		};
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
			/** Limit to tenants where logged-in user is a admin */
			adminOf?: boolean;
		} = {},
		limit = 0,
		skip = 0,
		sort: [string, 'asc' | 'desc'][],
	) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<TenantEntity> = {};
		const options: Mongo.Options<TenantEntity> = { sort };

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.adminOf) {
			const me = Meteor.userId();
			if (!me) {
				// User is not logged in...
				return [];
			}

			find.admins = me;
		}

		return this.find(find, options);
	}
}

export const Tenants = new TenantsCollection();

export default Tenants;
