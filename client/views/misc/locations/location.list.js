Router.map(function () {
	this.route('locations',{
		path: 'venues',
		template: 'locationlist',
		waitOn: function () {
			return Meteor.subscribe('locations', Session.get('region'));
		},
		onAfterAction: function() {
			document.title = webpagename + 'Location list'
		}
	})
});

Template.locationlist.helpers({
	locations: function() {
		var locations = Locations.find();

		if(Meteor.userId()) {
			Session.set("locationHosts",[Meteor.userId()]) // Variable brauchts für das New-Location-Formular. Hier wohl nicht so logisch, wo hintun?
		}

		return locations;
	},
	
	mayHost: function() {
		return this.hosts && this.hosts.indexOf(Meteor.userId()) !== -1;
	},

	region: function() {
		var regionId = Session.get('region')
		var regionObj = Regions.findOne(regionId)
		var regionName = regionObj ? regionObj.name : 'all regions'
		return regionName;
	}
});



