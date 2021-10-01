import { Meteor } from 'meteor/meteor';

import { TenantEntity, Tenants } from '/imports/api/tenants/tenants';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('tenant', function (tenantId) {
	const user = Meteor.user();

	if (!user) {
		this.ready();
		return undefined;
	}

	const filter: Mongo.Selector<TenantEntity> = { _id: tenantId };

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privileged(user, 'admin')) {
		filter.members = user._id;
	}

	// Only admins can see all tenant admins. Note: Admin privileg is not something that is
	// likely to happen and reactive changes are not needed.
	const showAdminsFields =
		UserPrivilegeUtils.privileged(user, 'admin') || user.isTenantAdmin(tenantId) ? 1 : 0;

	return Tenants.find(filter, { fields: { ...Tenants.publicFields, admins: showAdminsFields } });
});

Meteor.publish('Tenants.findFilter', function (find, limit, skip, sort) {
	const filter = { ...find };

	const user = Meteor.user();

	if (!user) {
		this.ready();
		return undefined;
	}

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privileged(user, 'admin')) {
		filter.members = user._id;
	}

	return Tenants.findFilter(filter, limit, skip, sort);
});
