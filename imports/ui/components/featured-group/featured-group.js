import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import Regions from '/imports/api/regions/regions.js';

import './featured-group.html';

Template.featuredGroup.onCreated(function featuredGroupOnCreated() {
	this.autorun(() => {
		const region = Regions.findOne(Session.get('region'));
		if (region) this.subscribe('group', region.featuredGroup);
	});

	this.featuredGroupId = () => {
		const region = Regions.findOne(Session.get('region'));
		if (region) return region.featuredGroup;
		return false;
	};
});

Template.featuredGroup.helpers({
	showFeaturedGroup() {
		if (!Template.instance().featuredGroupId()) return false;

		// only show featured group on certain pages
		const routes = ['home', 'find'];
		const router = Router.current();
		return routes.some(route => router.route && router.route.getName() === route);
	},

	featuredGroup: () => {
		const featuredGroupId = Template.instance().featuredGroupId();
		if (featuredGroupId) return Groups.findOne(featuredGroupId);
	},

	regionName: () => Regions.findOne(Session.get('region')).name
});
