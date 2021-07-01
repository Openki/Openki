import { Meteor } from 'meteor/meteor';

import { Tenants } from '/imports/api/tenants/tenants';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('tenant', (tenantId) => {
	// Only admins can see all tenant admins. Note: Admin privileg is not something that is
	// likely to happen and reactive changes are not needed.
	const showAdminsFields =
		UserPrivilegeUtils.privilegedTo('admin') || Meteor.user().isTenantAdmin(tenantId)
			? 1
			: undefined;

	return Tenants.find(
		{
			_id: tenantId,
			$or: [
				{ members: Meteor.userId() }, // only members or
				{ admins: Meteor.userId() }, // admins of a tenant can see the tenant
			],
		},
		{ fields: { ...Tenants.publicFields, admins: showAdminsFields } },
	);
});

Meteor.publish('Tenants.findFilter', (find, limit, skip, sort) =>
	Tenants.findFilter(
		{
			...find,
			$or: [
				{ members: Meteor.userId() }, // only members or
				{ admins: Meteor.userId() }, // admins of a tenant can see the tenant
			],
		},
		limit,
		skip,
		sort,
	),
);
