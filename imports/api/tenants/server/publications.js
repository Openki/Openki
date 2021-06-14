import { Meteor } from 'meteor/meteor';

import { Tenants } from '/imports/api/tenants/tenants';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Meteor.publish('tenants', () => {
	const filter = {
		_id: { $nin: Meteor.settings.public.publicTenants },
	};

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privilegedTo('admin')) {
		filter.members = Meteor.userId();
	}

	return Tenants.find(filter, { fields: Tenants.publicFields });
});

Meteor.publish('tenant', (tenantId) => {
	const filter = {
		_id: tenantId,
	};

	// Only members of a tenant or admins can see the tenant
	if (!UserPrivilegeUtils.privilegedTo('admin')) {
		filter.members = Meteor.userId();
	}

	return Tenants.find(filter, { fields: Tenants.publicFields });
});
