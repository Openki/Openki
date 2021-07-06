import { Meteor } from 'meteor/meteor';
import { Regions } from '/imports/api/regions/regions';

import { visibleTenants } from '/imports/utils/visible-tenants';

Meteor.publish('Regions', () => Regions.find({ tenant: { $in: visibleTenants() } }));

Meteor.publish('regionDetails', (id) =>
	Regions.find({ _id: id, tenant: { $in: visibleTenants() } }),
);

Meteor.publish('Regions.findFilter', (filter, limit, skip, sort) => {
	if (!visibleTenants().includes(filter.tenant)) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	return Regions.findFilter(filter, limit, skip, sort);
});
