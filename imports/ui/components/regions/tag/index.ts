import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Regions from '/imports/api/regions/publications';

import { SubscriptionType } from '/imports/utils/ServerPublishBlaze';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'regionTag',
	{ region: string },
	{
		regions: ReactiveVar<SubscriptionType<typeof Regions['all']> | undefined>;
	}
>;

const template = Template.regionTag;

template.onCreated(function () {
	const instance = this;

	instance.regions = new ReactiveVar(undefined);
	instance.autorun(() => {
		instance.regions.set(Regions.all.subscribe());
	});
});

template.helpers({
	regionName() {
		const instance = Template.instance();
		return instance.regions
			.get()?.()
			.fetch()
			.find((r) => r._id === instance.data.region)?.name;
	},
	hasMultipleRegions() {
		const instance = Template.instance();
		return instance.regions.get()?.().count() ?? 0 > 1;
	},
});
