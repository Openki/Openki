import { Meteor } from 'meteor/meteor';

import { FindFilter, Invitations } from '/imports/api/invitations/invitations';
import { Tenants } from '/imports/api/tenants/tenants';

import { ServerPublish } from '/imports/utils/ServerPublish';
import { FieldSort } from '/imports/utils/sort-spec';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

export const details = ServerPublish('invitation', function (tenantId: string, token: string) {
	const invitation = Invitations.find({ tenant: tenantId, token });

	if (invitation.count() === 0) {
		return undefined;
	}

	return [invitation, Tenants.find(tenantId)];
});

export const findFilter = ServerPublish(
	'invitations.findFilter',
	function (filter: FindFilter, limit, skip, sort: FieldSort[]) {
		const tenantId = filter.tenant;

		const user = Meteor.user();

		if (
			!user ||
			!(UserPrivilegeUtils.privileged(user, 'admin') || (tenantId && user.isTenantAdmin(tenantId)))
		) {
			return undefined;
		}

		return Invitations.findFilter(filter, limit, skip, sort);
	},
);
