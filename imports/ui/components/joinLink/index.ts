import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { TenantModel } from '/imports/api/tenants/tenants';
import * as JoinLinks from '/imports/api/joinLinks/publications';
import * as JoinLinksMethodes from '/imports/api/joinLinks/methods';

import { ReactiveVar } from 'meteor/reactive-var';
import { SubscriptionType } from '/imports/utils/ServerPublishBlaze';

import '/imports/ui/components/delete-confirm';
import './create';
import './rebuild';

import './template.html';

export interface Data {
	tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<
	'joinLink',
	Data,
	{
		joinLink: ReactiveVar<SubscriptionType<(typeof JoinLinks)['findFilter']> | undefined>;
	}
>;

const template = Template.joinLink;

template.onCreated(function () {
	const instance = this;
	const { tenant } = instance.data;

	instance.joinLink = new ReactiveVar(undefined);

	instance.autorun(() => {
		instance.joinLink.set(JoinLinks.findFilter.subscribe({ tenant: tenant._id }));
	});
});

template.helpers({
	joinLink() {
		const instance = Template.instance();
		return instance.joinLink.get()?.()?.fetch()[0];
	},

	deleteConfirmAttr() {
		const instance = Template.instance();
		return {
			confirmText: i18n(
				'joinLink.reallydelete',
				'Please confirm that you would like to delete this join link.',
			),
			confirmButton: i18n('joinLink.confirm.button', 'Delete this join link'),
			onRemove: async () => {
				await JoinLinksMethodes.remove(instance.data.tenant._id);
			},
			busyButton: i18n('joinLink.confirm.button.busy', 'Deleting join link…'),
		};
	},
});
