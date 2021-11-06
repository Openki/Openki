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
	/**
	 * @param {string} tenantId
	 */
	regions(tenantId) {
		return Regions.findFilter({ tenant: tenantId });
	},

	/**
	 * @param {string} tenantId
	 */
	addRegionQuery(tenantId) {
		return `tenant=${tenantId}`;
	},

	showAddRegion() {
		const { tenant } = Template.instance().data;
		return tenant.editableBy(Meteor.user());
	},
});
