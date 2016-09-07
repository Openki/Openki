Router.map(function () {
	this.route('venues',{
		path: 'venues',
		template: 'venueList',
		waitOn: function () {
			return Meteor.subscribe('venues', cleanedRegion(Session.get('region')));
		},
		onAfterAction: function() {
			document.title = webpagename + 'Venues list';
		}
	});
});

Template.venueList.helpers({
	venues: function() {
		var pred = {};
		var region = cleanedRegion(Session.get('region'));
		if (region) pred.region = region;
		return Venues.find(pred);
	},

	mayHost: function() {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	},

	region: function() {
		var regionId = Session.get('region');
		var regionObj = Regions.findOne(regionId);
		if (regionObj) return regionObj.name;
		return false;
	}
});



