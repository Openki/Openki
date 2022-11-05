import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as JoinLinks from '/imports/api/joinLinks/methods';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'joinLinkRemove', { tenantId: string }>;

const template = Template.joinLinkRemove;

template.events({
	async 'click .js-join-link-remove'(_event, instance) {
		await JoinLinks.remove(instance.data.tenantId);
	},
});
