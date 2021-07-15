import { Meteor } from 'meteor/meteor';

import { Invitations } from '../invitations';
import { Tenants } from '../../tenants/tenants';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('invitation', function (tenantId, token) {
	const invitation = Invitations.find({ tenant: tenantId, token });

	if (invitation.count() === 0) {
		this.ready();
	}

	return [invitation, Tenants.find(tenantId)];
});

Meteor.publish('invitations.find', function (filter) {
	const tenantId = filter.tenant;

	const user = Meteor.user();

	if (!user || !(UserPrivilegeUtils.privileged(user, 'admin') || user.isTenantAdmin(tenantId))) {
		this.ready();
		return undefined;
	}

	return Invitations.find({ tenant: tenantId });
});
