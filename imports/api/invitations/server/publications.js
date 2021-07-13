import { Meteor } from 'meteor/meteor';

import { Invitations } from '../invitations';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('invitations.find', function (filter) {
	const tenantId = filter.tenant;

	const user = Meteor.user();

	if (!user || !(UserPrivilegeUtils.privileged(user, 'admin') || user.isTenantAdmin(tenantId))) {
		this.ready();
		return undefined;
	}

	return Invitations.find({ tenant: tenantId });
});
