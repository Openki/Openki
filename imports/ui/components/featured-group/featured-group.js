import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import Groups from '/imports/api/groups/groups';
import Regions from '/imports/api/regions/regions';

import './featured-group.html';

Template.featuredGroup.onCreated(function featuredGroupOnCreated() {
	this.featuredGroupId = () => {
		const region = Regions.findOne(Session.get('region'));
		if (region?.featuredGroup) {
			return region.featuredGroup;
		}
		return false;
	};

	this.featuredGroup = () => Groups.findOne(this.featuredGroupId());

	this.autorun(() => {
		const gid = this.featuredGroupId();
		if (gid) {
			this.subscribe('group', gid);
		}
	});
});

Template.featuredGroup.helpers({
	featuredGroup: () => Template.instance().featuredGroup(),

	regionName: () => Regions.findOne(Session.get('region')).name,
});
