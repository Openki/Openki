import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Tenants } from './tenants';
import { Users } from '/imports/api/users/users';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as usersTenantsDenormalizer from '../users/tenantsDenormalizer';

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

		const senderId = Meteor.userId();
		if (!senderId) {
			throw new Meteor.Error('Not permitted');
		}

		// Only current tenant admins may draft other people into it
		// We build a selector that only finds the tenant if the sender is a
		// member of it.
		const sel = {
			_id: tenantId,
			admins: senderId,
		};

		// This check is not strictly necessary when the update uses the same
		// selector. It generates an error message though, whereas the update is
		// blind to that.
		if (!Tenants.findOne(sel)) {
			throw new Meteor.Error('No permitted');
		}

		const user = Users.findOne({ _id: userId });
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
});
