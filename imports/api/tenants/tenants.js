import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

/** @typedef {import('../users/users').UserModel} UserModel */

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Filtering } from '/imports/utils/filtering';

// ======== DB-Model: ========
/**
 * @typedef {Object} TenantEntity
 * @property {string} _id ID
 * @property {string} name
 * @property {string[]} members List of userIds
 * @property {string[]} admins List of tenant admins
 */

/**
 * @typedef {Tenant & TenantEntity} TenantModel
 */

export class Tenant {
	/**
	 * Check whether a user may edit the tenant.
	 * @this {TenantModel}
	 * @param {UserModel | undefined} user
	 */
	editableBy(user) {
		if (!user) {
			return false;
		}

		return (
			UserPrivilegeUtils.privileged(user, 'admin') /* Admins can edit all regions */ ||
			user.isTenantAdmin(this._id) /* or admins of a tenant */
		);
	}
}

/**
 * @extends {Mongo.Collection<TenantEntity, TenantModel>}
 */
export class TenantsCollection extends Mongo.Collection {
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
	 * @param {object} [filter] dictionary with filter options
	 * @param {boolean} [filter.adminOf] Limit to tenants where logged-in user is a admin
	 * @param {number} [limit]
	 * @param {number} [skip]
	 * @param {*} [sort]
	 */
	findFilter(filter = {}, limit = 0, skip = 0, sort) {
		const find = {};

		/**
		 * @type {Mongo.Options<TenantEntity>}
		 */
		const options = { sort };

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
