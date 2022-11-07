import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import * as JoinLinks from '/imports/api/joinLinks/methods';

import '/imports/ui/components/buttons';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'joinLinkRemove',
	{ tenantId: string },
	{
		state: ReactiveDict<{ confirm: boolean }>;
	}
>;

const template = Template.joinLinkRemove;

template.onCreated(function () {
	const instance = this;
	instance.busy(false);
	instance.state = new ReactiveDict();
	instance.state.setDefault({ confirm: false });
});

template.events({
	async 'click .js-join-link-remove'(_event, instance) {
		instance.state.set('confirm', true);
	},
	async 'click .js-join-link-remove-collapse'(_event, instance) {
		instance.state.set('confirm', false);
	},
	async 'click .js-join-link-remove-confirm'(_event, instance) {
		await JoinLinks.remove(instance.data.tenantId);
		instance.state.set('confirm', false);
	},
});
