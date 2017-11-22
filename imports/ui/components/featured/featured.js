import './featured.html';

Template.featured.onCreated(function featuredOnCreated() {
	this.subscribe('regions');
});

Template.featured.helpers({
	featuring() {
		const region = Regions.findOne(Session.get('region'));
		if (region) return region.featuring;
	}
});
