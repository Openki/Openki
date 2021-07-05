import { check } from 'meteor/check';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';

import * as RegionsMethods from '/imports/api/regions/methods';

import '/imports/ui/components/regions/display/region-display';
import '/imports/ui/components/regions/edit/region-edit';

import './region-details.html';

Template.regionDetails.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		const { isNew, region } = Template.currentData();
		check(region.tenant, String);

		if (!isNew) {
			check(region._id, String);
		}
	});

	instance.state = new ReactiveDict();
	instance.state.setDefault({
		editing: false,
	});
});

Template.regionDetails.helpers({
	editing() {
		return Template.instance().state.get('editing');
	},

	createArgs() {
		const instance = Template.instance();
		const { region } = instance.data;
		return {
			region,
			title: mf('region.edit.titleCreate', 'Create new region'),
			async onSave(changes) {
				const regionId = await RegionsMethods.create({ tenant: region.tenant, ...changes });
				Router.go('regionDetails', { _id: regionId });
			},
			onCancel() {
				Router.go('tenantDetails', { _id: region.tenant });
			},
		};
	},

	editArgs() {
		const instance = Template.instance();
		const { region } = instance.data;
		return {
			region,
			title: mf('region.edit.titleEdit', 'Edit region'),
			async onSave(changes) {
				await RegionsMethods.update(region._id, changes);
				instance.state.set('editing', false);
			},
			onCancel() {
				instance.state.set('editing', false);
			},
		};
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
		};
	},
});
