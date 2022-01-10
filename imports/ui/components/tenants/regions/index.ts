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
	const { tenant } = instance.data;
	instance.autorun(() => {
		instance.subscribe('Regions.findFilter', { tenant: tenant._id });
	});
});

Template.tenantRegions.helpers({
	regions(tenantId: string) {
		return Regions.findFilter({ tenant: tenantId });
	},

	addRegionQuery(tenantId: string) {
		return `tenant=${tenantId}`;
	},

	showAddRegion() {
		const { tenant } = Template.instance().data;
		return tenant.editableBy(Meteor.user());
	},
});
