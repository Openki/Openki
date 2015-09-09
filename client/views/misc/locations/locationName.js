Template.locationName.helpers({
	name: function() {
		if (!this) return;
		var locationId = ''+this; // it's not a string?! LOL I DUNNO
		Template.instance().subscribe('locationDetails', locationId);
		var location = Locations.findOne(locationId);
		return location && location.name;
	}
});