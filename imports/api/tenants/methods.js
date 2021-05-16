import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Tenants } from './tenants';
import { Users } from '/imports/api/users/users';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as usersTenantsDenormalizer from '../users/tenantsDenormalizer';
import { ServerMethod } from '/imports/utils/ServerMethod';

export const updateMembership = ServerMethod(
	'tenant.updateMembership',
	/**
	 * @param {string} userId
	 * @param {string} tenantId
	 * @param {boolean} join
	 */
	(userId, tenantId, join) => {
		check(userId, String);
		check(tenantId, String);
		check(join, Boolean);

		if (!UserPrivilegeUtils.privilegedTo('admin')) {
			throw new Meteor.Error('Not permitted');
		}

		const user = Users.findOne(userId);
		if (!user) {
			throw new Meteor.Error(404, 'User not found');
		}

		let update;
		if (join) {
			update = { $addToSet: { members: user._id } };
		} else {
			update = { $pull: { members: user._id } };
		}

		Tenants.update(tenantId, update);

		usersTenantsDenormalizer.afterTenantUpdateMembership(user._id, tenantId, join);
	},
);

export default updateMembership;
