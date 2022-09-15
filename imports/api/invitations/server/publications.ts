import { Meteor } from 'meteor/meteor';

import { FindFilter, Invitations } from '/imports/api/invitations/invitations';
import { Tenants } from '/imports/api/tenants/tenants';
import { FieldSort } from '/imports/utils/sort-spec';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('invitation', function (tenantId, token) {
	const invitation = Invitations.find({ tenant: tenantId, token });

	if (invitation.count() === 0) {
		this.ready();
	}

	return [invitation, Tenants.find(tenantId)];
});

Meteor.publish(
	'invitations.findFilter',
	function (filter: FindFilter, limit, skip, sort: FieldSort[]) {
		const tenantId = filter.tenant;

		const user = Meteor.user();

		if (
			!user ||
			!(UserPrivilegeUtils.privileged(user, 'admin') || (tenantId && user.isTenantAdmin(tenantId)))
		) {
			this.ready();
			return undefined;
		}

		return Invitations.findFilter(filter, limit, skip, sort);
	},
);
