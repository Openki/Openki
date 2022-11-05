import { Meteor } from 'meteor/meteor';

import { FindFilter, JoinLinks } from '/imports/api/joinLinks/joinLinks';
import { Tenants } from '/imports/api/tenants/tenants';
import { FieldSort } from '/imports/utils/sort-spec';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('joinLink', function (tenantId, token) {
	const joinLink = JoinLinks.find({ tenant: tenantId, token });

	if (joinLink.count() === 0) {
		this.ready();
	}

	return [joinLink, Tenants.find(tenantId)];
});

Meteor.publish(
	'joinLink.findFilter',
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

		return JoinLinks.findFilter(filter, limit, skip, sort);
	},
);
