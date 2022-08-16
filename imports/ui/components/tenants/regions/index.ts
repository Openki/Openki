import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { Regions } from '/imports/api/regions/regions';
import { TenantModel } from '/imports/api/tenants/tenants';

import './template.html';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<'tenantRegions', Data>;

const template = Template.tenantRegions;

template.onCreated(function () {
	const instance = this;
	instance.autorun(() => {
		const { tenant } = Template.currentData();
		instance.subscribe('Regions.findFilter', { tenant: tenant._id });
	});
});

Template.tenantRegions.helpers({
	regions() {
		const instance = Template.instance();
		const { tenant } = instance.data;
		console.log(Regions.findFilter({ tenant: tenant._id }).fetch());
		return Regions.findFilter({ tenant: tenant._id });
		
	},

	showAddRegion() {
		const instance = Template.instance();
		const { tenant } = instance.data;
		return tenant.editableBy(Meteor.user());
	},
});
