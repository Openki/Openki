import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Tenants } from '/imports/api/tenants/tenants';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'adminTenantsPage'>;

const template = Template.adminTenantsPage;

template.helpers({
	tenants() {
		return Tenants.find();
	},
});
