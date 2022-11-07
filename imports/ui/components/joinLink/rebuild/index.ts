import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import * as JoinLinks from '/imports/api/joinLinks/methods';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'joinLinkRebuild',
	{ tenantId: string },
	{ state: ReactiveDict<{ confirm: boolean }> }
>;

const template = Template.joinLinkRebuild;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);
	instance.state = new ReactiveDict();
	instance.state.setDefault({ confirm: false });
});

template.events({
	'click .js-join-link-rebuild'(_event, instance) {
		instance.state.set('confirm', true);
	},
	'click .js-join-link-rebuild-collapse'(_event, instance) {
		instance.state.set('confirm', false);
	},
	async 'click .js-join-link-rebuild-confirm'(_event, instance) {
		await JoinLinks.create(instance.data.tenantId);
		instance.state.set('confirm', false);
	},
});
