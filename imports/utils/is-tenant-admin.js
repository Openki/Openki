import { check } from 'meteor/check';

import { Tenants } from '/imports/api/tenants/tenants';

/**
 * @param {string} userId
 * @param {string} tenantId
 */
export function isTenantAdmin(userId, tenantId) {
	check(userId, String);
	check(tenantId, String);
	return (
		Tenants.find(
			{
				_id: tenantId,
				admins: userId,
			},
			{ limit: 1 },
		).count() > 0
	);
}

export default isTenantAdmin;
