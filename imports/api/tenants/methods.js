import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Tenants from './tenants';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import userTenantDenormalizer from '../users/tenantDenormalizer';

Meteor.methods({
	/**
	 * @param {string} userId
	 * @param {string} tenantId
	 * @param {boolean} join
	 */
	'tenant.updateMembership'(userId, tenantId, join) {
		check(userId, String);
		check(tenantId, String);
		check(join, Boolean);

		if (!UserPrivilegeUtils.privilegedTo('admin')) {
			throw new Meteor.Error('Not permitted');
		}

		const user = Meteor.users.findOne(userId);
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

		userTenantDenormalizer.afterUpdateMembership(user._id, tenantId, join);
	},
});
