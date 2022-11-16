import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Groups from '/imports/api/groups/publications';
import { Regions } from '/imports/api/regions/regions';

import { SubscriptionType } from '/imports/utils/ServerPublishBlaze';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'featuredGroup',
	Record<string, unknown>,
	{ featuredGroup: ReactiveVar<SubscriptionType<typeof Groups['details']> | undefined> }
>;

const template = Template.featuredGroup;

template.onCreated(function () {
	const instance = this;

	instance.featuredGroup = new ReactiveVar(undefined);

	instance.autorun(() => {
		const region = Regions.currentRegion();
		const featuredGroupId = region?.featuredGroup;
		if (!featuredGroupId) {
			instance.featuredGroup.set(undefined);
		} else {
			instance.featuredGroup.set(Groups.details.subscribe(instance, featuredGroupId));
		}
	});
});

template.helpers({
	featuredGroup() {
		return Template.instance().featuredGroup.get()?.();
	},
});
