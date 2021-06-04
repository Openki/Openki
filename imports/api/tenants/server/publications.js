import { Meteor } from 'meteor/meteor';

import { Tenants } from '/imports/api/tenants/tenants';

Meteor.publish('tenant', (tenantId) =>
	Tenants.find(
		{
			_id: tenantId,
			members: Meteor.userId(), // only members of a tenant can see the tenant
		},
		{ fields: Tenants.publicFields },
	),
);
