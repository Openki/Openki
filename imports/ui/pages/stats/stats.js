import { Router } from 'meteor/iron:router';

import Regions from '/imports/api/regions/regions';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

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
	console.log(this.region.get());
	this.stats = new ReactiveVar(false);
	
	
	this.autorun(() => {
		this.stats.set(false);
		Meteor.call('stats.region', this.region.get(), (err, stats) => {
			if (!err) {
				this.stats.set(stats);
			}
		});
	});
});


Template.stats.helpers({
	isAdmin() {
		return UserPrivilegeUtils.privileged(Meteor.user(), 'admin');
	},
	regionName() {
			console.log(Template.instance().region.get());
			const currentRegion = Regions.findOne({_id: Template.instance().region.get()});
			console.log(currentRegion);
			return currentRegion.name;
	},
	regions() {
		return Regions.find();
	},
	regionStats() {
		const regionSelector = document.querySelector('.js-stats-region-selector');
		
		if (regionSelector) {
			regionSelector.value = Template.instance().region.get();
		}
		return Template.instance().stats.get();
	},
});

Template.stats.events({
	'change .js-stats-region-selector'(event, instance) {
		instance.region.set(event.target.value);
	},
});
