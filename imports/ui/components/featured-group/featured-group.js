import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import Groups from '/imports/api/groups/groups.js';
import Regions from '/imports/api/regions/regions.js';

import './featured-group.html';

Template.featuredGroup.onCreated(function featuredGroupOnCreated() {
	this.featuredGroupId = () => {
		const region = Regions.findOne(Session.get('region'));
		if (region && region.featuredGroup) {
			return region.featuredGroup;
		}
		return false;
	};

	this.featuredGroup = () => {
		return Groups.findOne(this.featuredGroupId());
	};

	this.autorun(() => {
		const gid = this.featuredGroupId();
		if (gid) {
			this.subscribe('group', gid);
		}
	});
});

Template.featuredGroup.helpers({
	featuredGroup: () => {
		return Template.instance().featuredGroup();
	},

	regionName: () => Regions.findOne(Session.get('region')).name
});
