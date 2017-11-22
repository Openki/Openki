import './featured.html';

import Regions from '/imports/api/regions/regions.js';

Template.featured.onCreated(function featuredOnCreated() {
	this.subscribe('regions');
});

Template.featured.helpers({
	featuring() {
		const region = Regions.findOne(Session.get('region'));
		if (region) return region.featuring;
	}
});
