import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { TenantModel } from '/imports/api/tenants/tenants';
import * as JoinLinks from '/imports/api/joinLinks/publications';

import { SubscriptionType } from '/imports/utils/ServerPublishBlaze';

import './create';
import './rebuild';
import '../remove-confirmation';

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
});
