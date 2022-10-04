import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Tenants } from '/imports/api/tenants/tenants';

import { i18n } from '/imports/startup/both/i18next';
import * as Metatags from '/imports/utils/metatags';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'adminTenantsPage'>;

const template = Template.adminTenantsPage;

template.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		Metatags.setCommonTags(i18n('tenants.windowtitle', 'Organizations'));
	});
});

template.helpers({
	tenants() {
		return Tenants.find();
	},
});
