import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import * as StatsMethods from 'imports/api/stats/methods';
import { Regions } from '/imports/api/regions/regions';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import './stats.html';

const getRegionFromQuery = () => {
	const region = Router.current().params.query.region;
	if (region) {
		return region;
	}
	return 'all_regions';
};

Template.stats.onCreated(function () {
	this.subscribe('Regions');
	this.regionName = new ReactiveVar(false);
	this.region = new ReactiveVar(getRegionFromQuery());
	this.stats = new ReactiveVar(false);

	this.autorun(async () => {
		this.stats.set(false);
		const stats = await StatsMethods.region(this.region.get());
		this.stats.set(stats);
	});
});

Template.stats.helpers({
	isAdmin() {
		return UserPrivilegeUtils.privilegedTo('admin');
	},
	regionName() {
		const currentRegion = Regions.findOne({ _id: Template.instance().region.get() });
		return currentRegion?.name || '';
	},
	regionStats() {
		return Template.instance().stats.get();
	},
	selectedRegion() {
		if (
			!Object.prototype.hasOwnProperty.call(this, '_id') &&
			Template.instance().region.get() === 'all_regions'
		) {
			return 'selected';
		}
		return this._id === Template.instance().region.get() ? 'selected' : '';
	},
});

Template.stats.events({
	'change .js-stats-region-selector'(event, instance) {
		instance.region.set(event.target.value);
	},
});
