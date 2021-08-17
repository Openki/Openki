import { Template } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';

import './template.html';
import './styles.scss';

Template.regionTag.helpers({
	regionName() {
		return Regions.findOne(this.region)?.name;
	},
});
