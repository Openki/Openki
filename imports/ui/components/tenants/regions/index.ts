import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import * as Regions from '/imports/api/regions/publications';
import { TenantModel } from '/imports/api/tenants/tenants';

import { SubscriptionType } from '/imports/utils/ServerPublish';

import './template.html';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<
	'tenantRegions',
	Data,
	{
		regions: SubscriptionType<typeof Regions['findFilter']>;
	}
>;

const template = Template.tenantRegions;

template.onCreated(function () {
	const instance = this;
	instance.autorun(() => {
		const { tenant } = Template.currentData();
		instance.regions = Regions.findFilter.subscribe(instance, { tenant: tenant._id });
	});
});

template.helpers({
	regions() {
		const instance = Template.instance();
		return instance.regions();
	},

	showAddRegion() {
		const instance = Template.instance();
		const { tenant } = instance.data;
		return tenant.editableBy(Meteor.user());
	},
});
