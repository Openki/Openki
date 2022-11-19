import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { TenantModel } from '/imports/api/tenants/tenants';
import { JoinLinks } from '/imports/api/joinLinks/joinLinks';

import './create';
import './rebuild';
import './remove';

import './template.html';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<'joinLink', Data>;

const template = Template.joinLink;

template.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;

	instance.autorun(() => {
		instance.subscribe('joinLink.findFilter', { tenant: tenant._id });
	});
});

template.helpers({
	joinLink() {
		const instance = Template.instance();
		return JoinLinks.findFilter({ tenant: instance.data.tenant._id }).fetch()[0];
	},
});
