import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as JoinLinks from '/imports/api/joinLinks/methods';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'joinLinkCreate', { tenantId: string }>;

const template = Template.joinLinkCreate;

template.events({
	async 'click .js-join-link-create'(_event, instance) {
		await JoinLinks.create(instance.data.tenantId);
	},
});
