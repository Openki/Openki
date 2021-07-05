import { Meteor } from 'meteor/meteor';

import { Tenants } from '/imports/api/tenants/tenants';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('tenant', (tenantId) => {
	const filter = { _id: tenantId };

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privilegedTo('admin')) {
		filter.members = Meteor.userId();
	}

	// Only admins can see all tenant admins. Note: Admin privileg is not something that is
	// likely to happen and reactive changes are not needed.
	const showAdminsFields =
		UserPrivilegeUtils.privilegedTo('admin') || Meteor.user().isTenantAdmin(tenantId)
			? 1
			: undefined;

	return Tenants.find(filter, { fields: { ...Tenants.publicFields, admins: showAdminsFields } });
});

Meteor.publish('Tenants.findFilter', (find, limit, skip, sort) => {
	const filter = { ...find };

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privilegedTo('admin')) {
		filter.members = Meteor.userId();
	}

	return Tenants.findFilter(filter, limit, skip, sort);
});
