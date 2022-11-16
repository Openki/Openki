import { Meteor } from 'meteor/meteor';

import { FindFilter, Invitations } from '/imports/api/invitations/invitations';
import { Tenants } from '/imports/api/tenants/tenants';

import { ServerPublish } from '/imports/utils/ServerPublishBlaze';
import { FieldSort } from '/imports/utils/sort-spec';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

export const details = ServerPublish(
	'invitation',
	(tenantId: string, token: string) => {
		const invitation = Invitations.find({ tenant: tenantId, token });

		if (invitation.count() === 0) {
			return undefined;
		}

		return [invitation, Tenants.find(tenantId)];
	},
	(tenantId: string, token: string) => {
		const invitation = Invitations.findOne({ tenant: tenantId, token });

		if (!invitation) {
			return undefined;
		}

		return { invitation, tenant: Tenants.findOne(tenantId) };
	},
);

export const findFilter = ServerPublish(
	'invitations.findFilter',
	(filter: FindFilter, limit, skip, sort: FieldSort[]) => {
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
