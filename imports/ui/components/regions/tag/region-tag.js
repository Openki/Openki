import { Template } from 'meteor/templating';

import './region-tag.html';

Template.regionTag.helpers({
	regionName() {
		return Regions.findOne(this.region).name;
	}
});
