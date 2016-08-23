Router.map(function () {
	this.route('venues',{
		path: 'venues',
		template: 'venueList',
		waitOn: function () {
			return Meteor.subscribe('venues', Session.get('region'));
		},
		onAfterAction: function() {
			document.title = webpagename + 'Venues list';
		}
	});
});

Template.locationlist.helpers({
	locations: function() {
		return Venues.find({ region: Session.get('region') });
	},

	mayHost: function() {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	},

	region: function() {
		var regionId = Session.get('region');
		var regionObj = Regions.findOne(regionId);
		var regionName = regionObj ? regionObj.name : 'all regions';
		return regionName;
	}
});



