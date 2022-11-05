import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as JoinLinks from '/imports/api/joinLinks/methods';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'joinLinkRebuild', { tenantId: string }>;

const template = Template.joinLinkRebuild;

template.events({
	async 'click .js-join-link-rebuild'(_event, instance) {
		await JoinLinks.create(instance.data.tenantId);
	},
});
