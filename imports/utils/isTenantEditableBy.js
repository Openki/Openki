import { check } from 'meteor/check';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { isTenantAdmin } from '/imports/utils/is-tenant-admin';

/**
 * Check whether a user may edit the region.
 * @param {string} tenantId
 * @param {string} userId
 */
export function isTenantEditableBy(tenantId, userId) {
	check(tenantId, String);
	check(userId, String);

	return (
		UserPrivilegeUtils.privileged(userId, 'admin') /* Admins can edit all tenants */ ||
		isTenantAdmin(userId, this.tenant) /* or admins of a tenant */
	);
}

export default isTenantEditableBy;
