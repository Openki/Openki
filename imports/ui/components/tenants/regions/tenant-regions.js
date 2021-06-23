import { Template } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';

import './tenant-regions.html';

Template.tenantRegions.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;
	instance.autorun(() => {
		instance.subscribe('Regions.findFilter', { tenant: tenant._id });
	});
});

Template.tenantRegions.helpers({
	regions(tenantId) {
		return Regions.findFilter({ tenant: tenantId });
	},
});
