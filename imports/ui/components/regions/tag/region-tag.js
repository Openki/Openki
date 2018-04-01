import { Template } from 'meteor/templating';

import Regions from '/imports/api/regions/regions.js';

import './region-tag.html';

Template.regionTag.helpers({
	regionName() {
		return Regions.findOne(this.region).name;
	}
});
