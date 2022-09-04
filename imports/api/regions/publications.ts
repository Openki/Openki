import { Meteor } from 'meteor/meteor';
import { Regions } from '/imports/api/regions/regions';
import { ServerPublish } from '/imports/utils/ServerPublish';

import { visibleTenants } from '/imports/utils/visible-tenants';

export const all = ServerPublish('Regions', () =>
	Regions.find({ tenant: { $in: visibleTenants() } }),
);

export const details = ServerPublish(
	'regionDetails',
	(id: string) => Regions.find({ _id: id, tenant: { $in: visibleTenants() } }),
	(id: string) => Regions.findOne({ _id: id, tenant: { $in: visibleTenants() } }),
);

export const findFilter = ServerPublish(
	'Regions.findFilter',
	(
		filter?: {
			tenant?: string;
		},
		limit?: number,
		skip?: number,
		sort?: [string, 'asc' | 'desc'][] | undefined,
	) => {
		if (filter?.tenant && !visibleTenants().includes(filter.tenant)) {
			throw new Meteor.Error(401, 'Not permitted');
		}

		return Regions.findFilter(filter, limit, skip, sort);
	},
);
