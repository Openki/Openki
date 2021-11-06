import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { TenantModel } from '/imports/api/tenants/tenants';

import '/imports/ui/components/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/tenants/settings/tenant-settings';
import '/imports/ui/components/tenants/regions/tenant-regions';

import './template.html';
import './styles.scss';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<'tenantDetailsPage', Data>;

const template = Template.tenantDetailsPage;

template.helpers({
	editingSettings() {
		const { tenant } = Template.instance().data;
		return tenant.editableBy(Meteor.user());
	},
});
