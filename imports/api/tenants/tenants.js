import { Mongo } from 'meteor/mongo';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

// ======== DB-Model: ========
/**
 * @typedef {Object} TenantEntity
 * @property {string} _id ID
 * @property {string} name
 * @property {string[]} members List of userIds
 * @property {string[]} admins List of tenant admins
 */

/**
 * @extends {Mongo.Collection<TenantEntity>}
 */
export class TenantsCollection extends Mongo.Collection {
	constructor() {
		super('Tenants');
	}

	// eslint-disable-next-line class-methods-use-this
	get publicFields() {
		return {
			_id: 1,
			name: 1,
			members: 1,
			// Only admins can see all tenant admins. Note: Admin privileg is not something that is 
			// likely to happen and reactive changes are not needed.
			admins: UserPrivilegeUtils.privilegedTo('admin') ? 1 : undefined,
		};
	}
}

export const Tenants = new TenantsCollection();

export default Tenants;
