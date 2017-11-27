import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import Regions from '/imports/api/regions/regions.js';

import './featured-group.html';

Template.featuredGroup.onCreated(function featuredGroupOnCreated() {
	this.featuredGroup = new ReactiveVar(false);
	this.autorun(() => {
		const currentRegion = Regions.findOne(Session.get('region'));
		if (currentRegion) {
			const featuredGroup = currentRegion.featuredGroup;
			this.subscribe('group', featuredGroup, () => {
				this.featuredGroup.set(Groups.findOne(featuredGroup));
			});
		}
	});
});

Template.featuredGroup.helpers({
	showFeaturedGroup() {
		if (!Template.instance().featuredGroup.get()) return false;

		// only show featured group on certain pages
		const routes = ['home', 'find'];
		const router = Router.current();
		return routes.some(route => router.route && router.route.getName() === route);
	},

	featuredGroup: () => Template.instance().featuredGroup.get(),
	regionName: () => Regions.findOne(Session.get('region')).name
});
