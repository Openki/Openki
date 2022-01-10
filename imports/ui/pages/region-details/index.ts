import { check } from 'meteor/check';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { RegionModel } from '/imports/api/regions/regions';
import * as RegionsMethods from '/imports/api/regions/methods';

import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/regions/display';
import type { Data as DisplayData } from '/imports/ui/components/regions/display';
import '/imports/ui/components/regions/edit';
import type { Data as EditData } from '/imports/ui/components/regions/edit';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'regionDetailsPage',
	{
		isNew: boolean;
		region: RegionModel;
	},
	{ state: ReactiveDict<{ editing: boolean }> }
>;

const template = Template.regionDetailsPage;

template.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		const { isNew, region } = Template.currentData();
		check(region.tenant, String);

		if (!isNew) {
			check(region._id, String);
		}
	});

	instance.state = new ReactiveDict(undefined, { editing: false });
});

template.helpers({
	editing() {
		return Template.instance().state.get('editing');
	},

	createArgs() {
		const instance = Template.instance();
		const { region } = instance.data;
		return {
			region,
			title: i18n('region.edit.titleCreate', 'Create new region'),
			async onSave(changes) {
				const regionId = await RegionsMethods.create({ tenant: region.tenant, ...changes });

				Router.go('regionDetails', { _id: regionId });

				Analytics.trackEvent('Region creations', 'Region creations');
			},
			onCancel() {
				Router.go('tenantDetails', { _id: region.tenant });
			},
		} as EditData;
	},

	editArgs() {
		const instance = Template.instance();
		const { region } = instance.data;
		return {
			region,
			title: i18n('region.edit.titleEdit', 'Edit region'),
			async onSave(changes) {
				await RegionsMethods.update(region._id, changes);
				instance.state.set('editing', false);
			},
			onCancel() {
				instance.state.set('editing', false);
			},
		} as EditData;
	},

	displayArgs() {
		const instance = Template.instance();
		const { region } = instance.data;
		return {
			region,
			onEdit() {
				instance.state.set('editing', true);
			},
			async onDelete() {
				await RegionsMethods.remove(region._id);
				Router.go('tenantDetails', { _id: region.tenant });
			},
		} as DisplayData;
	},
});
