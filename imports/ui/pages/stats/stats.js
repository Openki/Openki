import { Router } from 'meteor/iron:router';

import './stats.html';


const getRegionFromQuery = () => {
	const region = Router.current().params.query.region;
	if (region) {
		return region;
	}
	return 'all_regions';
};

Template.stats.onCreated(function () {
	const region = getRegionFromQuery();
	this.statsReady = new ReactiveVar(false);
	Meteor.call('stats.region', region, (err, stats) => {
		if (!err) {
			this.stats = stats;
			this.statsReady.set(true);
		}
	});
});

Template.stats.helpers({
	regionStats() {
		return Template.instance().stats;
	},
	statsReady() {
		return Template.instance().statsReady.get();
	},
});
